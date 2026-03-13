// ═══════════════════════════════════════════════════════════════
// ALPHA PACK CAPITAL MAX — v6.0 · Database Layer
// Complete Supabase Integration
// ═══════════════════════════════════════════════════════════════

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ────────────────────────────────────────────────────────────
// AUTHENTICATION
// ────────────────────────────────────────────────────────────
export const Auth = {
  /**
   * Get current user session
   */
  async getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    return { session, error };
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const { session } = await this.getSession();
    return !!session?.user;
  },

  /**
   * Get user role
   */
  async getUserRole(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return { role: data?.role, error };
  },

  /**
   * Register new student
   */
  async register({
    email,
    password,
    fullName,
    phone,
    institution,
    program,
    yearOfStudy,
    studentIdNo,
  }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          institution,
          program,
          year_of_study: yearOfStudy,
          student_id_no: studentIdNo,
          role: "user",
        },
      },
    });

    if (error) throw new Error(error.message);

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabaseClient.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        institution,
        program,
        year_of_study: yearOfStudy,
        student_id_no: studentIdNo,
        role: "user",
        kyc_status: "not_started",
      });
      if (profileError) throw new Error(profileError.message);
    }

    return data;
  },

  /**
   * Register admin (special function)
   */
  async registerAdmin(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { role: "admin" },
      },
    });

    if (error) throw new Error(error.message);

    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
          id: data.user.id,
          email,
          role: "admin",
          kyc_status: "approved",
        });
      if (profileError) throw new Error(profileError.message);
    }

    return data;
  },

  /**
   * Login with email/password
   */
  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(
        error.message.includes("Invalid")
          ? "Incorrect email or password. Please try again."
          : error.message
      );
    }

    return data;
  },

  /**
   * Logout
   */
  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Require authentication (guard)
   */
  async requireAuth() {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      throw new Error("Authentication required");
    }
    return await this.getUser();
  },

  /**
   * Require admin role (guard)
   */
  async requireAdmin() {
    const { user, error: userError } = await this.getUser();
    if (!user) throw new Error("Not authenticated");

    const { role, error: roleError } = await this.getUserRole(user.id);
    if (roleError || role !== "admin") {
      throw new Error("Admin access required");
    }

    return user;
  },
};

// ────────────────────────────────────────────────────────────
// LOANS
// ────────────────────────────────────────────────────────────
export const Loans = {
  /**
   * Submit loan application
   */
  async submit({
    userId,
    packageId,
    packageLabel,
    principal,
    interest,
    total,
    repaymentDays,
    purpose,
    phone,
  }) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + repaymentDays);

    const { data, error } = await supabaseClient
      .from("loans")
      .insert({
        user_id: userId,
        package_id: packageId,
        package_label: packageLabel,
        principal: Number(principal),
        interest: Number(interest),
        interest_rate: interest / principal,
        total_repayable: Number(total),
        repayment_days: repaymentDays,
        due_date: dueDate.toISOString().split("T")[0],
        purpose,
        contact_phone: phone,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Get loans for user
   */
  async forUser(userId) {
    const { data, error } = await supabaseClient
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Get all loans (admin)
   */
  async all(status = null) {
    let query = supabaseClient
      .from("loans")
      .select("*, profiles:user_id(full_name,email,phone,institution,student_id_no)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Get single loan
   */
  async getOne(loanId) {
    const { data, error } = await supabaseClient
      .from("loans")
      .select("*, profiles:user_id(full_name,email,phone,institution,student_id_no)")
      .eq("id", loanId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Approve/Decline loan
   */
  async decision(loanId, status) {
    const { error } = await supabaseClient
      .from("loans")
      .update({
        status,
        decided_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (error) throw new Error(error.message);
  },

  /**
   * Get statistics
   */
  async stats() {
    const { data } = await supabaseClient.from("loans").select("status,principal,interest");

    const loans = data || [];
    const getByStatus = (status) => loans.filter((l) => l.status === status);
    const sum = (arr, key) => arr.reduce((a, l) => a + Number(l[key]), 0);

    return {
      total: loans.length,
      pending: getByStatus("pending").length,
      approved: getByStatus("approved").length,
      declined: getByStatus("declined").length,
      totalDisbursed: sum(getByStatus("approved"), "principal"),
      totalInterest: sum(getByStatus("approved"), "interest"),
    };
  },
};

// ────────────────────────────────────────────────────────────
// KYC (Know Your Customer)
// ────────────────────────────────────────────────────────────
export const KYC = {
  /**
   * Submit KYC documents
   */
  async submit(userId, frontFile, backFile) {
    const timestamp = Date.now();
    const uploadFile = async (file, side) => {
      const ext = file.name.match(/\.[^.]+$/)?.[0] || ".jpg";
      const path = `kyc/${userId}/${side}_${timestamp}${ext}`;

      const { error } = await supabaseClient.storage
        .from("kyc-docs")
        .upload(path, file, { upsert: true });

      if (error) throw new Error(`Upload ${side} failed: ${error.message}`);

      const { data } = supabaseClient.storage
        .from("kyc-docs")
        .getPublicUrl(path);

      return data.publicUrl;
    };

    const [frontUrl, backUrl] = await Promise.all([
      uploadFile(frontFile, "front"),
      uploadFile(backFile, "back"),
    ]);

    const { error } = await supabaseClient
      .from("profiles")
      .update({
        kyc_status: "pending",
        kyc_front_url: frontUrl,
        kyc_back_url: backUrl,
        kyc_submitted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return { frontUrl, backUrl };
  },

  /**
   * Get KYC pending submissions (admin)
   */
  async getPending() {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("kyc_status", "pending")
      .order("kyc_submitted_at");

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Approve/Reject KYC
   */
  async decision(userId, status) {
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        kyc_status: status,
        kyc_decided_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  },
};

// ────────────────────────────────────────────────────────────
// ADVERTISEMENTS
// ────────────────────────────────────────────────────────────
export const Ads = {
  /**
   * Get active ads
   */
  async getActive() {
    const { data, error } = await supabaseClient
      .from("ads")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Get all ads (admin)
   */
  async all() {
    const { data, error } = await supabaseClient
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Create ad
   */
  async create(ad) {
    const { error } = await supabaseClient.from("ads").insert(ad);
    if (error) throw new Error(error.message);
  },

  /**
   * Update ad
   */
  async update(id, updates) {
    const { error } = await supabaseClient
      .from("ads")
      .update(updates)
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  /**
   * Delete ad
   */
  async delete(id) {
    const { error } = await supabaseClient.from("ads").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

// ────────────────────────────────────────────────────────────
// ADMIN OPERATIONS
// ────────────────────────────────────────────────────────────
export const Admin = {
  /**
   * Get all users
   */
  async getAllUsers() {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Get business settings
   */
  async getSettings() {
    const { data, error } = await supabaseClient
      .from("settings")
      .select("*")
      .single();

    return data || {};
  },

  /**
   * Save business settings
   */
  async saveSettings(settings) {
    const existing = await this.getSettings();

    if (existing?.id) {
      const { error } = await supabaseClient
        .from("settings")
        .update(settings)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseClient.from("settings").insert(settings);
      if (error) throw new Error(error.message);
    }
  },

  /**
   * Log admin action
   */
  async logAction(userId, event, meta = {}) {
    await supabaseClient
      .from("audit_log")
      .insert({
        user_id: userId,
        event,
        meta,
      })
      .catch(() => {});
  },
};

export const db = supabaseClient;
export default { Auth, Loans, KYC, Ads, Admin, db };

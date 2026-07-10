const supabaseUrl = "https://tdcpbvuusudpzpycodtf.supabase.co";
const supabaseKey = "sb_publishable_JzTeIkheMuix-QBci5JpEg_IgWpvCYw";

window.supabaseClient = null;

try {
  if (typeof supabase !== "undefined") {
    window.supabaseClient = supabase.createClient(
        supabaseUrl,
        supabaseKey
    );
    console.log("Supabase Connected:", window.supabaseClient);
  } else {
    console.warn("Supabase library is not loaded. Network CDN might be blocked.");
  }
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
}
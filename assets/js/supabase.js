const supabaseUrl = "https://tdcpbvuusudpzpycodtf.supabase.co";

const supabaseKey = "sb_publishable_JzTeIkheMuix-QBci5JpEg_IgWpvCYw";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);
console.log("Supabase Connected:", window.supabaseClient);
const supabaseUrl = "https://tdcpbvuusudpzpycodtf.supabase.co";

const supabaseKey = "sb_publishable_JzTeIkheMuix-QBci5JpEg_IgWpvCYw";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function testSupabase() {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

testSupabase();
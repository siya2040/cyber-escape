const supabaseUrl = "https://tdcpbvuusudpzpycodtf.supabase.co";

const supabaseKey = "sb_publishable_JzTeIkheMuix-QBci5JpEg_IgWpvCYw";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

async function testInsert() {

    const { data, error } = await supabaseClient
        .from("profiles")
        .insert([
            {
                username: "Siya",
                xp: 100,
                level: 1
            }
        ]);

    console.log("DATA:", data);
    console.log("ERROR:", error);
}

testInsert();
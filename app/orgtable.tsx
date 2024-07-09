// import { createClient } from '@supabase/supabase-js';

// // Initialize the Supabase client
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

// async function addProfilesToOrganisation() {
//     try {
//         // Fetch profiles with organisation == 'samvid'
//         const { data: profiles, error } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('organisation', 'samvid');

//         if (error) {
//             console.error('Error fetching profiles:', error);
//             return;
//         }

//         // Insert profiles into the organisation table
//         for (const profile of profiles) {
//             const { id, organisation } = profile;
//             const { error: insertError } = await supabase
//                 .from('organisation')
//                 .insert([{ profile_id: id, name: organisation }]);

//             if (insertError) {
//                 console.error(`Error inserting profile ${id} into organisation:`, insertError);
//             }
//         }

//         console.log('Profiles added to organisation table successfully!');
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// // Call the function (you might want to trigger this function based on some event or page load)
// addProfilesToOrganisation();

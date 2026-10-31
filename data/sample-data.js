// SAMPLE DATA ONLY. All animals are fictional.
(function(){
const d={vaccinated:"Yes",sterilised:"Yes",ear_notched:"No",published:"Yes",last_updated:"2025-01-15",intake_date:"2024-11-02",area_found:"Sector 135",size:"Medium",sex:"Male",species:"Dog",photo_url:"",story:"",special_needs:"",temperament:"Friendly",good_with:"Adults",last_vaccination_date:"2025-01-10",breed_or_description:"Indie",colour:"Brown",approx_age:"2 years"};
const rows=[
{animal_id:"SH-0001",name:"Bholu (sample)",status:"Adoptable",story:"A gentle sample dog who loves walks.",last_updated:"2025-02-01"},
{animal_id:"SH-0002",name:"Mitthu (sample)",species:"Cat",sex:"Female",size:"Small",status:"Adoptable",colour:"Ginger",good_with:"Cats, children"},
{animal_id:"SH-0003",name:"Rani (sample)",sex:"Female",status:"In care",vaccinated:"Partial",sterilised:"No",special_needs:"Healing a leg wound; needs rest."},
{animal_id:"SH-0004",name:"Tiger (sample)",size:"Large",status:"Fostered",ear_notched:"Yes"},
{animal_id:"SH-0005",name:"Moti (sample)",sex:"Female",status:"Adopted",last_updated:"2025-01-30"},
{animal_id:"SH-0006",name:"Kalu (sample)",status:"Released after sterilisation",ear_notched:"Yes",temperament:"Shy"},
{animal_id:"SH-0007",name:"Chhoti (sample)",sex:"Female",size:"Small",status:"Adoptable",photo_url:"",vaccinated:"No",sterilised:"Unknown"},
{animal_id:"SH-0008",name:"Sheru (sample)",size:"Large",status:"Adoptable",story:"Sheru arrived as a frightened sample dog. ".repeat(25)},
{animal_id:"SH-0009",name:"Billo (sample)",species:"Cat",sex:"Unknown",size:"Small",status:"In care",sterilised:"Unknown"},
{animal_id:"SH-0010",name:"Hidden (sample)",status:"Adoptable",published:"No"}
];
window.SAMPLE_ANIMALS=rows.map(r=>Object.assign({},d,r));
})();

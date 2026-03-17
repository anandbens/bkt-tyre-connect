// 150 dummy customer profiles for demo prefill

const firstNames = [
  "Rajesh", "Amit", "Suresh", "Vikram", "Manoj", "Anil", "Sanjay", "Ravi", "Deepak", "Prakash",
  "Rahul", "Ajay", "Nitin", "Sachin", "Vinod", "Ashok", "Ramesh", "Ganesh", "Mukesh", "Pradeep",
  "Kiran", "Santosh", "Sunil", "Harish", "Yogesh", "Dinesh", "Naveen", "Pavan", "Mahesh", "Girish",
  "Anand", "Mohan", "Rohit", "Varun", "Tarun", "Gaurav", "Vishal", "Kunal", "Arjun", "Rakesh",
  "Bharat", "Chetan", "Dhanraj", "Firoz", "Govind", "Hemant", "Ishwar", "Jatin", "Kamal", "Lalit",
];

const lastNames = [
  "Kumar", "Singh", "Sharma", "Patel", "Verma", "Gupta", "Yadav", "Reddy", "Joshi", "Mishra",
  "Pandey", "Chauhan", "Thakur", "Nair", "Pillai", "Deshmukh", "Patil", "More", "Jadhav", "Kulkarni",
  "Tiwari", "Dubey", "Srivastava", "Mehta", "Shah", "Bhat", "Hegde", "Gowda", "Naik", "Shetty",
];

const statesAndCities: [string, string, string][] = [
  ["Maharashtra", "Pune", "MH"],
  ["Maharashtra", "Mumbai", "MH"],
  ["Maharashtra", "Nagpur", "MH"],
  ["Maharashtra", "Nashik", "MH"],
  ["Gujarat", "Ahmedabad", "GJ"],
  ["Gujarat", "Surat", "GJ"],
  ["Gujarat", "Vadodara", "GJ"],
  ["Gujarat", "Rajkot", "GJ"],
  ["Rajasthan", "Jaipur", "RJ"],
  ["Rajasthan", "Jodhpur", "RJ"],
  ["Rajasthan", "Udaipur", "RJ"],
  ["Madhya Pradesh", "Indore", "MP"],
  ["Madhya Pradesh", "Bhopal", "MP"],
  ["Uttar Pradesh", "Lucknow", "UP"],
  ["Uttar Pradesh", "Kanpur", "UP"],
  ["Uttar Pradesh", "Agra", "UP"],
  ["Uttar Pradesh", "Varanasi", "UP"],
  ["Karnataka", "Bengaluru", "KA"],
  ["Karnataka", "Mysuru", "KA"],
  ["Karnataka", "Hubli", "KA"],
  ["Tamil Nadu", "Chennai", "TN"],
  ["Tamil Nadu", "Coimbatore", "TN"],
  ["Tamil Nadu", "Madurai", "TN"],
  ["Telangana", "Hyderabad", "TS"],
  ["Andhra Pradesh", "Visakhapatnam", "AP"],
  ["Andhra Pradesh", "Vijayawada", "AP"],
  ["Punjab", "Ludhiana", "PB"],
  ["Punjab", "Amritsar", "PB"],
  ["Haryana", "Gurgaon", "HR"],
  ["Haryana", "Faridabad", "HR"],
  ["West Bengal", "Kolkata", "WB"],
  ["Bihar", "Patna", "BR"],
  ["Odisha", "Bhubaneswar", "OD"],
  ["Kerala", "Kochi", "KL"],
  ["Chhattisgarh", "Raipur", "CG"],
];

const vehicleModels = [
  "Tata Ace Gold", "Tata Ace EV", "Tata Ultra T.7", "Tata LPT 1916",
  "Ashok Leyland Dost", "Ashok Leyland Bada Dost", "Ashok Leyland Ecomet",
  "Mahindra Bolero Pickup", "Mahindra Supro", "Mahindra Blazo X 28",
  "Eicher Pro 2049", "Eicher Pro 3015", "Eicher Pro 6037",
  "BharatBenz 1217C", "BharatBenz 2823R",
  "SML Isuzu Sartaj GS", "Force Traveller",
  "Tata Signa 4825.TK", "Tata Prima 4028.S",
  "Volvo FH16", "Scania P410",
  "Tata Intra V30", "Tata Yodha 2.0",
  "Mahindra Jayo", "Piaggio Ape",
];

const tyreTypes = [
  "BKT Agrimax RT657", "BKT AT171", "BKT Earthmax SR41",
  "BKT Agrimax Force", "BKT Flotation 648", "BKT Ridemax IT696",
  "BKT Agrimax RT855", "BKT Multimax MP513", "BKT Earthmax SR31",
  "BKT Pacmaster", "BKT Agrimax Teris", "BKT Maxi Traction",
  "BKT AW702", "BKT TR171", "BKT AS504",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface DummyCustomer {
  name: string;
  email: string;
  state: string;
  city: string;
  vehicleNumber: string;
  vehicleMakeModel: string;
  tyreDetails: string;
  numberOfTyres: string;
  invoiceNumber: string;
}

export function getDummyCustomer(mobile: string): DummyCustomer {
  // Create a numeric seed from the mobile number
  const seed = mobile.split("").reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1) * 31, 0);
  const rng = seededRandom(seed);

  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rng() * 99)}@example.com`;

  const loc = pick(statesAndCities);
  const state = loc[0];
  const city = loc[1];
  const rto = loc[2];

  const district = Math.floor(rng() * 50) + 1;
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const l1 = letters[Math.floor(rng() * letters.length)];
  const l2 = letters[Math.floor(rng() * letters.length)];
  const num = Math.floor(rng() * 9000) + 1000;
  const vehicleNumber = `${rto}${String(district).padStart(2, "0")}${l1}${l2}${num}`;

  const vehicleMakeModel = pick(vehicleModels);
  const tyreDetails = pick(tyreTypes);
  const numberOfTyres = String(Math.floor(rng() * 6) + 2); // 2-7
  const invYear = 2025 + Math.floor(rng() * 2);
  const invNum = Math.floor(rng() * 90000) + 10000;
  const invoiceNumber = `INV-${invYear}-${invNum}`;

  return { name, email, state, city, vehicleNumber, vehicleMakeModel, tyreDetails, numberOfTyres, invoiceNumber };
}

// Mock medical data for AI training

export const doctors = [
  {
    id: "1",
    name: "Rajesh Kumar",
    specialty: "Cardiologist",
    experience: 15,
    hospital: "Lilavati Hospital, Mumbai",
    fees: 800,
    languages: ["English", "Hindi"],
    rating: 4.8,
    availability: "Mon-Sat 10AM-6PM"
  },
  {
    id: "2",
    name: "Priya Sharma",
    specialty: "Cardiologist",
    experience: 12,
    hospital: "Ruby Hall Clinic, Pune",
    fees: 700,
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.7,
    availability: "Mon-Fri 9AM-5PM"
  },
  {
    id: "3",
    name: "Anjali Desai",
    specialty: "Pediatrician",
    experience: 10,
    hospital: "Kokilaben Ambani Hospital, Mumbai",
    fees: 600,
    languages: ["English", "Hindi", "Gujarati"],
    rating: 4.9,
    availability: "Mon-Sat 11AM-7PM"
  },
  {
    id: "4",
    name: "Vikram Patel",
    specialty: "Orthopedic Surgeon",
    experience: 18,
    hospital: "Jehangir Hospital, Pune",
    fees: 900,
    languages: ["English", "Hindi"],
    rating: 4.6,
    availability: "Tue-Sat 2PM-8PM"
  },
  {
    id: "5",
    name: "Meera Reddy",
    specialty: "Dermatologist",
    experience: 8,
    hospital: "Wockhardt Hospital, Nagpur",
    fees: 550,
    languages: ["English", "Hindi", "Telugu"],
    rating: 4.5,
    availability: "Mon-Fri 10AM-6PM"
  },
  {
    id: "6",
    name: "Arjun Singh",
    specialty: "Neurologist",
    experience: 20,
    hospital: "Fortis Hospital, Mumbai",
    fees: 1000,
    languages: ["English", "Hindi", "Punjabi"],
    rating: 4.9,
    availability: "Mon-Sat 9AM-4PM"
  },
  {
    id: "7",
    name: "Kavita Joshi",
    specialty: "Gynecologist",
    experience: 14,
    hospital: "Sahyadri Hospital, Pune",
    fees: 750,
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.8,
    availability: "Mon-Sat 10AM-6PM"
  },
  {
    id: "8",
    name: "Suresh Nair",
    specialty: "General Physician",
    experience: 25,
    hospital: "Apollo Hospital, Nashik",
    fees: 500,
    languages: ["English", "Hindi", "Malayalam"],
    rating: 4.7,
    availability: "Mon-Sun 8AM-10PM"
  }
];

export const hospitals = [
  {
    id: "1",
    name: "Lilavati Hospital",
    city: "Mumbai",
    location: "Bandra West, Mumbai",
    specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics"],
    rating: 4.7,
    beds: 500,
    emergency: true,
    phone: "+91-22-26567891",
    address: "A-791, Bandra Reclamation, Bandra West, Mumbai - 400050"
  },
  {
    id: "2",
    name: "Kokilaben Ambani Hospital",
    city: "Mumbai",
    location: "Andheri West, Mumbai",
    specialties: ["Multi-specialty", "Advanced Surgery", "Cancer Care", "Pediatrics"],
    rating: 4.8,
    beds: 650,
    emergency: true,
    phone: "+91-22-30999999",
    address: "Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai - 400053"
  },
  {
    id: "3",
    name: "Ruby Hall Clinic",
    city: "Pune",
    location: "Pune",
    specialties: ["Cardiology", "Neurology", "Gastroenterology", "Urology"],
    rating: 4.6,
    beds: 350,
    emergency: true,
    phone: "+91-20-26163000",
    address: "40, Sassoon Road, Pune - 411001"
  },
  {
    id: "4",
    name: "Jehangir Hospital",
    city: "Pune",
    location: "Pune",
    specialties: ["Multi-specialty", "Critical Care", "Orthopedics", "Nephrology"],
    rating: 4.7,
    beds: 380,
    emergency: true,
    phone: "+91-20-26331000",
    address: "32, Sassoon Road, Pune - 411001"
  },
  {
    id: "5",
    name: "Fortis Hospital",
    city: "Mumbai",
    location: "Mulund, Mumbai",
    specialties: ["Cardiac Sciences", "Neurosciences", "Renal Sciences", "Orthopedics"],
    rating: 4.6,
    beds: 315,
    emergency: true,
    phone: "+91-22-67914444",
    address: "Mulund Goregaon Link Road, Mumbai - 400078"
  },
  {
    id: "6",
    name: "Wockhardt Hospital",
    city: "Nagpur",
    location: "Nagpur",
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Gastroenterology"],
    rating: 4.5,
    beds: 250,
    emergency: true,
    phone: "+91-712-2441111",
    address: "1643, North Ambazari Road, Nagpur - 440033"
  },
  {
    id: "7",
    name: "Sahyadri Hospital",
    city: "Pune",
    location: "Pune",
    specialties: ["Multi-specialty", "Maternity", "Pediatrics", "Oncology"],
    rating: 4.6,
    beds: 200,
    emergency: true,
    phone: "+91-20-67206720",
    address: "Plot No. 30-C, Erandwane, Pune - 411004"
  },
  {
    id: "8",
    name: "Apollo Hospital",
    city: "Nashik",
    location: "Nashik",
    specialties: ["Multi-specialty", "Emergency Care", "Surgery", "Diagnostics"],
    rating: 4.5,
    beds: 180,
    emergency: true,
    phone: "+91-253-6608888",
    address: "Trimbak Road, Nashik - 422002"
  }
];

export const medicines = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 25,
    prescription: false,
    manufacturer: "Cipla",
    uses: "Fever, headache, body pain"
  },
  {
    id: "2",
    name: "Ibuprofen 400mg",
    category: "Anti-inflammatory",
    price: 45,
    prescription: false,
    manufacturer: "Dr. Reddy's",
    uses: "Pain, inflammation, fever"
  },
  {
    id: "3",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    price: 120,
    prescription: true,
    manufacturer: "Sun Pharma",
    uses: "Bacterial infections"
  },
  {
    id: "4",
    name: "Cetirizine 10mg",
    category: "Antihistamine",
    price: 35,
    prescription: false,
    manufacturer: "Cipla",
    uses: "Allergies, hay fever, itching"
  },
  {
    id: "5",
    name: "Omeprazole 20mg",
    category: "Antacid",
    price: 80,
    prescription: false,
    manufacturer: "Lupin",
    uses: "Acidity, GERD, ulcers"
  },
  {
    id: "6",
    name: "Metformin 500mg",
    category: "Diabetes",
    price: 60,
    prescription: true,
    manufacturer: "USV",
    uses: "Type 2 diabetes"
  },
  {
    id: "7",
    name: "Atorvastatin 10mg",
    category: "Cholesterol",
    price: 95,
    prescription: true,
    manufacturer: "Ranbaxy",
    uses: "High cholesterol"
  },
  {
    id: "8",
    name: "Azithromycin 250mg",
    category: "Antibiotic",
    price: 150,
    prescription: true,
    manufacturer: "Alkem",
    uses: "Bacterial infections, respiratory infections"
  },
  {
    id: "9",
    name: "Vitamin D3 1000IU",
    category: "Supplement",
    price: 180,
    prescription: false,
    manufacturer: "HealthKart",
    uses: "Vitamin D deficiency, bone health"
  },
  {
    id: "10",
    name: "Aspirin 75mg",
    category: "Blood Thinner",
    price: 40,
    prescription: false,
    manufacturer: "Bayer",
    uses: "Heart health, blood clot prevention"
  }
];

export const medicalConditions = {
  fever: {
    symptoms: ["High temperature", "Chills", "Sweating", "Headache", "Body aches"],
    treatments: ["Paracetamol", "Rest", "Hydration"],
    whenToSeekHelp: "If fever persists for more than 3 days or exceeds 103°F"
  },
  headache: {
    symptoms: ["Pain in head", "Sensitivity to light", "Nausea"],
    treatments: ["Paracetamol", "Ibuprofen", "Rest in dark room"],
    whenToSeekHelp: "If severe, sudden, or accompanied by confusion or vision changes"
  },
  cold: {
    symptoms: ["Runny nose", "Sneezing", "Sore throat", "Cough"],
    treatments: ["Rest", "Fluids", "Cetirizine for allergies"],
    whenToSeekHelp: "If symptoms worsen after 7 days or difficulty breathing"
  },
  acidity: {
    symptoms: ["Heartburn", "Chest pain", "Sour taste", "Bloating"],
    treatments: ["Omeprazole", "Avoid spicy foods", "Eat smaller meals"],
    whenToSeekHelp: "If persistent or severe chest pain"
  }
};

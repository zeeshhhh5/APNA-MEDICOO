export interface MedicineData {
  name: string;
  genericName: string;
  ingredients: string;
  category: string;
  price: number;
  manufacturer: string;
  uses: string;
  requiresPrescription: boolean;
}

export const MEDICINES_DATABASE: MedicineData[] = [
  // ── Pain Relief & Fever ──
  { name: "Paracetamol 500mg", genericName: "Acetaminophen", ingredients: "Paracetamol IP 500mg, Starch, Povidone, Stearic Acid", category: "TABLET", price: 25, manufacturer: "Cipla", uses: "Fever, headache, body pain, toothache", requiresPrescription: false },
  { name: "Paracetamol 650mg", genericName: "Acetaminophen", ingredients: "Paracetamol IP 650mg, Microcrystalline Cellulose, Starch", category: "TABLET", price: 35, manufacturer: "GSK", uses: "High fever, moderate to severe pain", requiresPrescription: false },
  { name: "Ibuprofen 400mg", genericName: "Ibuprofen", ingredients: "Ibuprofen IP 400mg, Lactose, Maize Starch, Colloidal Silicon Dioxide", category: "TABLET", price: 45, manufacturer: "Dr. Reddy's", uses: "Pain, inflammation, fever, arthritis", requiresPrescription: false },
  { name: "Diclofenac 50mg", genericName: "Diclofenac Sodium", ingredients: "Diclofenac Sodium IP 50mg, Lactose, Maize Starch, Povidone", category: "TABLET", price: 30, manufacturer: "Novartis", uses: "Joint pain, muscle pain, inflammation", requiresPrescription: true },
  { name: "Aspirin 75mg", genericName: "Acetylsalicylic Acid", ingredients: "Aspirin IP 75mg, Maize Starch, Cellulose, Talc", category: "TABLET", price: 40, manufacturer: "Bayer", uses: "Heart health, blood clot prevention, mild pain", requiresPrescription: false },
  { name: "Aspirin 325mg", genericName: "Acetylsalicylic Acid", ingredients: "Aspirin IP 325mg, Starch, Cellulose Powder", category: "TABLET", price: 25, manufacturer: "USV", uses: "Pain relief, fever, anti-inflammatory", requiresPrescription: false },
  { name: "Nimesulide 100mg", genericName: "Nimesulide", ingredients: "Nimesulide IP 100mg, Lactose, Maize Starch, Magnesium Stearate", category: "TABLET", price: 35, manufacturer: "Panacea Biotec", uses: "Pain, inflammation, fever", requiresPrescription: true },
  { name: "Tramadol 50mg", genericName: "Tramadol HCl", ingredients: "Tramadol Hydrochloride IP 50mg, Microcrystalline Cellulose, Starch", category: "CAPSULE", price: 80, manufacturer: "Sun Pharma", uses: "Moderate to severe pain", requiresPrescription: true },
  { name: "Combiflam Tablet", genericName: "Ibuprofen + Paracetamol", ingredients: "Ibuprofen 400mg, Paracetamol 325mg, Starch, Talc", category: "TABLET", price: 40, manufacturer: "Sanofi", uses: "Headache, body pain, toothache, fever", requiresPrescription: false },
  { name: "Dolo 650", genericName: "Paracetamol", ingredients: "Paracetamol IP 650mg, Povidone, Croscarmellose Sodium", category: "TABLET", price: 32, manufacturer: "Micro Labs", uses: "Fever, headache, cold, body ache", requiresPrescription: false },

  // ── Antibiotics ──
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin", ingredients: "Amoxicillin Trihydrate IP eq. to Amoxicillin 500mg, Magnesium Stearate", category: "CAPSULE", price: 120, manufacturer: "Sun Pharma", uses: "Bacterial infections, ear infection, urinary tract infection", requiresPrescription: true },
  { name: "Amoxicillin 250mg", genericName: "Amoxicillin", ingredients: "Amoxicillin Trihydrate IP eq. to Amoxicillin 250mg", category: "CAPSULE", price: 75, manufacturer: "Cipla", uses: "Mild bacterial infections, dental infections", requiresPrescription: true },
  { name: "Azithromycin 250mg", genericName: "Azithromycin", ingredients: "Azithromycin Dihydrate IP eq. to Azithromycin 250mg, Pregelatinized Starch", category: "TABLET", price: 150, manufacturer: "Alkem", uses: "Respiratory infections, skin infections, ear infections", requiresPrescription: true },
  { name: "Azithromycin 500mg", genericName: "Azithromycin", ingredients: "Azithromycin Dihydrate IP eq. to Azithromycin 500mg, Calcium Phosphate", category: "TABLET", price: 220, manufacturer: "Zydus", uses: "Severe respiratory infections, pneumonia", requiresPrescription: true },
  { name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin", ingredients: "Ciprofloxacin HCl IP eq. to Ciprofloxacin 500mg, Starch, Magnesium Stearate", category: "TABLET", price: 85, manufacturer: "Ranbaxy", uses: "UTI, respiratory infections, bone infections", requiresPrescription: true },
  { name: "Levofloxacin 500mg", genericName: "Levofloxacin", ingredients: "Levofloxacin Hemihydrate IP eq. to Levofloxacin 500mg", category: "TABLET", price: 110, manufacturer: "Glenmark", uses: "Pneumonia, sinusitis, urinary infections", requiresPrescription: true },
  { name: "Cefixime 200mg", genericName: "Cefixime", ingredients: "Cefixime Trihydrate IP eq. to Cefixime 200mg, Magnesium Stearate", category: "TABLET", price: 130, manufacturer: "Lupin", uses: "Typhoid, UTI, respiratory infections", requiresPrescription: true },
  { name: "Metronidazole 400mg", genericName: "Metronidazole", ingredients: "Metronidazole IP 400mg, Maize Starch, Povidone", category: "TABLET", price: 40, manufacturer: "Abbott", uses: "Amoebic infections, anaerobic bacterial infections", requiresPrescription: true },
  { name: "Doxycycline 100mg", genericName: "Doxycycline", ingredients: "Doxycycline Hyclate IP eq. to Doxycycline 100mg, Lactose", category: "CAPSULE", price: 95, manufacturer: "Sun Pharma", uses: "Acne, chest infections, STIs, malaria prevention", requiresPrescription: true },
  { name: "Augmentin 625mg", genericName: "Amoxicillin + Clavulanate", ingredients: "Amoxicillin 500mg, Clavulanic Acid 125mg, Colloidal Silicon Dioxide", category: "TABLET", price: 210, manufacturer: "GSK", uses: "Severe bacterial infections, sinusitis, pneumonia", requiresPrescription: true },
  { name: "Cephalexin 500mg", genericName: "Cephalexin", ingredients: "Cephalexin Monohydrate IP eq. to Cephalexin 500mg", category: "CAPSULE", price: 90, manufacturer: "Ranbaxy", uses: "Skin infections, respiratory tract infections, UTI", requiresPrescription: true },

  // ── Antacids & Digestive ──
  { name: "Omeprazole 20mg", genericName: "Omeprazole", ingredients: "Omeprazole IP 20mg, Mannitol, Sodium Lauryl Sulphate, Sucrose", category: "CAPSULE", price: 80, manufacturer: "Lupin", uses: "Acidity, GERD, stomach ulcers", requiresPrescription: false },
  { name: "Pantoprazole 40mg", genericName: "Pantoprazole", ingredients: "Pantoprazole Sodium Sesquihydrate IP eq. to Pantoprazole 40mg", category: "TABLET", price: 95, manufacturer: "Alkem", uses: "Acid reflux, peptic ulcer, Zollinger-Ellison syndrome", requiresPrescription: true },
  { name: "Ranitidine 150mg", genericName: "Ranitidine", ingredients: "Ranitidine HCl IP eq. to Ranitidine 150mg, Cellulose", category: "TABLET", price: 35, manufacturer: "Cipla", uses: "Hyperacidity, stomach ulcers, heartburn", requiresPrescription: false },
  { name: "Domperidone 10mg", genericName: "Domperidone", ingredients: "Domperidone IP 10mg, Lactose, Maize Starch, Povidone", category: "TABLET", price: 45, manufacturer: "Sun Pharma", uses: "Nausea, vomiting, bloating, gastroparesis", requiresPrescription: false },
  { name: "Ondansetron 4mg", genericName: "Ondansetron", ingredients: "Ondansetron HCl Dihydrate IP eq. to Ondansetron 4mg", category: "TABLET", price: 55, manufacturer: "Dr. Reddy's", uses: "Severe nausea and vomiting", requiresPrescription: true },
  { name: "Eno Fruit Salt", genericName: "Sodium Bicarbonate + Citric Acid", ingredients: "Sodium Bicarbonate, Citric Acid, Sodium Carbonate, Sugar", category: "OTC", price: 20, manufacturer: "GSK", uses: "Instant acidity relief, heartburn, indigestion", requiresPrescription: false },
  { name: "Gelusil MPS", genericName: "Aluminium + Magnesium Hydroxide", ingredients: "Dried Aluminium Hydroxide Gel, Magnesium Hydroxide, Simethicone", category: "SYRUP", price: 75, manufacturer: "Pfizer", uses: "Acidity, gas, bloating, heartburn", requiresPrescription: false },
  { name: "Rabeprazole 20mg", genericName: "Rabeprazole", ingredients: "Rabeprazole Sodium IP 20mg, Mannitol, Magnesium Oxide", category: "TABLET", price: 90, manufacturer: "Cadila", uses: "GERD, peptic ulcer, dyspepsia", requiresPrescription: true },
  { name: "Sucralfate 1g", genericName: "Sucralfate", ingredients: "Sucralfate IP 1g, Silicon Dioxide, Magnesium Stearate", category: "TABLET", price: 65, manufacturer: "Abbott", uses: "Stomach ulcer, duodenal ulcer", requiresPrescription: true },

  // ── Allergy & Cold ──
  { name: "Cetirizine 10mg", genericName: "Cetirizine", ingredients: "Cetirizine Dihydrochloride IP 10mg, Lactose, Magnesium Stearate", category: "TABLET", price: 35, manufacturer: "Cipla", uses: "Allergies, hay fever, itching, runny nose", requiresPrescription: false },
  { name: "Levocetirizine 5mg", genericName: "Levocetirizine", ingredients: "Levocetirizine Dihydrochloride IP 5mg, Microcrystalline Cellulose", category: "TABLET", price: 45, manufacturer: "Sun Pharma", uses: "Allergic rhinitis, urticaria, itching", requiresPrescription: false },
  { name: "Montelukast 10mg", genericName: "Montelukast", ingredients: "Montelukast Sodium IP eq. to Montelukast 10mg, Lactose, Cellulose", category: "TABLET", price: 120, manufacturer: "Cipla", uses: "Asthma, allergic rhinitis, exercise-induced bronchospasm", requiresPrescription: true },
  { name: "Fexofenadine 120mg", genericName: "Fexofenadine", ingredients: "Fexofenadine HCl IP 120mg, Microcrystalline Cellulose, Croscarmellose", category: "TABLET", price: 85, manufacturer: "Sanofi", uses: "Seasonal allergies, chronic urticaria", requiresPrescription: false },
  { name: "Chlorpheniramine 4mg", genericName: "Chlorpheniramine Maleate", ingredients: "Chlorpheniramine Maleate IP 4mg, Lactose, Starch", category: "TABLET", price: 15, manufacturer: "Alkem", uses: "Cold, runny nose, sneezing, watery eyes", requiresPrescription: false },
  { name: "Sinarest Tablet", genericName: "Paracetamol + CPM + Phenylephrine", ingredients: "Paracetamol 500mg, Chlorpheniramine 2mg, Phenylephrine 10mg", category: "TABLET", price: 30, manufacturer: "Centaur", uses: "Cold, flu, nasal congestion, headache", requiresPrescription: false },

  // ── Cough & Respiratory ──
  { name: "Benadryl Cough Syrup", genericName: "Diphenhydramine", ingredients: "Diphenhydramine HCl 14.08mg/5ml, Ammonium Chloride, Sodium Citrate", category: "SYRUP", price: 95, manufacturer: "Johnson & Johnson", uses: "Dry cough, allergic cough", requiresPrescription: false },
  { name: "Honitus Cough Syrup", genericName: "Herbal Cough Formula", ingredients: "Tulsi, Mulethi, Banaphsha, Honey, Pudina", category: "SYRUP", price: 85, manufacturer: "Dabur", uses: "Cough, sore throat, congestion", requiresPrescription: false },
  { name: "Ascoril LS Syrup", genericName: "Ambroxol + Levosalbutamol + Guaifenesin", ingredients: "Ambroxol 30mg, Levosalbutamol 1mg, Guaifenesin 50mg per 5ml", category: "SYRUP", price: 110, manufacturer: "Glenmark", uses: "Wet cough with mucus, bronchitis, asthma", requiresPrescription: true },
  { name: "Salbutamol Inhaler", genericName: "Salbutamol", ingredients: "Salbutamol Sulphate IP eq. to Salbutamol 100mcg per actuation", category: "OTHER", price: 130, manufacturer: "Cipla", uses: "Asthma, wheezing, bronchospasm", requiresPrescription: true },
  { name: "Budesonide Inhaler 200mcg", genericName: "Budesonide", ingredients: "Budesonide IP 200mcg per actuation, HFA Propellant", category: "OTHER", price: 280, manufacturer: "AstraZeneca", uses: "Asthma maintenance, COPD", requiresPrescription: true },
  { name: "Deriphyllin Retard 150mg", genericName: "Theophylline + Etofylline", ingredients: "Theophylline 100mg, Etofylline 50mg", category: "TABLET", price: 45, manufacturer: "Abbott", uses: "Bronchial asthma, COPD, breathlessness", requiresPrescription: true },

  // ── Diabetes ──
  { name: "Metformin 500mg", genericName: "Metformin", ingredients: "Metformin Hydrochloride IP 500mg, Povidone, Magnesium Stearate", category: "TABLET", price: 60, manufacturer: "USV", uses: "Type 2 diabetes mellitus", requiresPrescription: true },
  { name: "Metformin 1000mg", genericName: "Metformin", ingredients: "Metformin Hydrochloride IP 1000mg, Povidone, Stearic Acid", category: "TABLET", price: 90, manufacturer: "Sun Pharma", uses: "Type 2 diabetes (higher dose)", requiresPrescription: true },
  { name: "Glimepiride 2mg", genericName: "Glimepiride", ingredients: "Glimepiride IP 2mg, Lactose, Sodium Starch Glycolate, Povidone", category: "TABLET", price: 70, manufacturer: "Sanofi", uses: "Type 2 diabetes mellitus", requiresPrescription: true },
  { name: "Sitagliptin 100mg", genericName: "Sitagliptin", ingredients: "Sitagliptin Phosphate Monohydrate eq. to Sitagliptin 100mg", category: "TABLET", price: 450, manufacturer: "MSD", uses: "Type 2 diabetes (DPP-4 inhibitor)", requiresPrescription: true },
  { name: "Insulin Glargine", genericName: "Insulin Glargine", ingredients: "Insulin Glargine 100 IU/ml, Zinc Chloride, m-Cresol, Glycerol", category: "INJECTION", price: 850, manufacturer: "Sanofi", uses: "Type 1 and Type 2 diabetes (long-acting insulin)", requiresPrescription: true },
  { name: "Voglibose 0.3mg", genericName: "Voglibose", ingredients: "Voglibose IP 0.3mg, Lactose, Microcrystalline Cellulose", category: "TABLET", price: 95, manufacturer: "Ranbaxy", uses: "Post-meal blood sugar control", requiresPrescription: true },
  { name: "Gliclazide 80mg", genericName: "Gliclazide", ingredients: "Gliclazide IP 80mg, Lactose, Maize Starch, Talc", category: "TABLET", price: 55, manufacturer: "Serdia", uses: "Type 2 diabetes mellitus", requiresPrescription: true },

  // ── Heart & Blood Pressure ──
  { name: "Atorvastatin 10mg", genericName: "Atorvastatin", ingredients: "Atorvastatin Calcium IP eq. to Atorvastatin 10mg, Calcium Carbonate", category: "TABLET", price: 95, manufacturer: "Ranbaxy", uses: "High cholesterol, heart disease prevention", requiresPrescription: true },
  { name: "Atorvastatin 20mg", genericName: "Atorvastatin", ingredients: "Atorvastatin Calcium IP eq. to Atorvastatin 20mg, Lactose", category: "TABLET", price: 140, manufacturer: "Pfizer", uses: "High cholesterol, LDL reduction", requiresPrescription: true },
  { name: "Rosuvastatin 10mg", genericName: "Rosuvastatin", ingredients: "Rosuvastatin Calcium IP eq. to Rosuvastatin 10mg, Cellulose", category: "TABLET", price: 160, manufacturer: "AstraZeneca", uses: "High cholesterol, cardiovascular protection", requiresPrescription: true },
  { name: "Amlodipine 5mg", genericName: "Amlodipine", ingredients: "Amlodipine Besylate IP eq. to Amlodipine 5mg, Calcium Phosphate", category: "TABLET", price: 50, manufacturer: "Pfizer", uses: "High blood pressure, angina", requiresPrescription: true },
  { name: "Amlodipine 10mg", genericName: "Amlodipine", ingredients: "Amlodipine Besylate IP eq. to Amlodipine 10mg, Microcrystalline Cellulose", category: "TABLET", price: 75, manufacturer: "Cipla", uses: "Severe hypertension, chronic angina", requiresPrescription: true },
  { name: "Losartan 50mg", genericName: "Losartan", ingredients: "Losartan Potassium IP 50mg, Microcrystalline Cellulose, Lactose", category: "TABLET", price: 85, manufacturer: "MSD", uses: "High blood pressure, diabetic kidney disease", requiresPrescription: true },
  { name: "Telmisartan 40mg", genericName: "Telmisartan", ingredients: "Telmisartan IP 40mg, Sodium Hydroxide, Povidone, Meglumine", category: "TABLET", price: 95, manufacturer: "Glenmark", uses: "Hypertension, cardiovascular risk reduction", requiresPrescription: true },
  { name: "Ramipril 5mg", genericName: "Ramipril", ingredients: "Ramipril IP 5mg, Starch, Gelatin Capsule Shell", category: "CAPSULE", price: 70, manufacturer: "Sanofi", uses: "High blood pressure, heart failure, post-MI", requiresPrescription: true },
  { name: "Metoprolol 50mg", genericName: "Metoprolol Succinate", ingredients: "Metoprolol Succinate IP eq. to Metoprolol Tartrate 50mg", category: "TABLET", price: 65, manufacturer: "AstraZeneca", uses: "High BP, heart rate control, angina", requiresPrescription: true },
  { name: "Atenolol 50mg", genericName: "Atenolol", ingredients: "Atenolol IP 50mg, Maize Starch, Calcium Hydrogen Phosphate", category: "TABLET", price: 35, manufacturer: "Cipla", uses: "Hypertension, angina, heart rhythm disorders", requiresPrescription: true },
  { name: "Clopidogrel 75mg", genericName: "Clopidogrel", ingredients: "Clopidogrel Bisulphate IP eq. to Clopidogrel 75mg, Lactose", category: "TABLET", price: 110, manufacturer: "Sun Pharma", uses: "Blood clot prevention, heart attack prevention", requiresPrescription: true },
  { name: "Ecosprin Gold", genericName: "Aspirin + Clopidogrel + Atorvastatin", ingredients: "Aspirin 75mg, Clopidogrel 75mg, Atorvastatin 10mg", category: "CAPSULE", price: 150, manufacturer: "USV", uses: "Post heart attack/stroke prevention", requiresPrescription: true },

  // ── Vitamins & Supplements ──
  { name: "Vitamin D3 1000IU", genericName: "Cholecalciferol", ingredients: "Cholecalciferol (Vitamin D3) 1000IU, Soybean Oil, Gelatin", category: "CAPSULE", price: 180, manufacturer: "HealthKart", uses: "Vitamin D deficiency, bone health, immunity", requiresPrescription: false },
  { name: "Vitamin D3 60000IU", genericName: "Cholecalciferol", ingredients: "Cholecalciferol IP 60000IU, Refined Groundnut Oil", category: "CAPSULE", price: 45, manufacturer: "Cadila", uses: "Severe Vitamin D deficiency (weekly dose)", requiresPrescription: true },
  { name: "Vitamin B Complex", genericName: "B-Complex Vitamins", ingredients: "Thiamine 10mg, Riboflavin 10mg, Niacin 75mg, Pyridoxine 3mg, Folic Acid 1.5mg, B12 15mcg", category: "TABLET", price: 50, manufacturer: "Abbott", uses: "B-vitamin deficiency, energy, nerve health", requiresPrescription: false },
  { name: "Vitamin C 500mg", genericName: "Ascorbic Acid", ingredients: "Ascorbic Acid IP 500mg, Citric Acid, Sodium Bicarbonate", category: "TABLET", price: 40, manufacturer: "Cipla", uses: "Immunity boost, cold prevention, antioxidant", requiresPrescription: false },
  { name: "Calcium + Vitamin D3", genericName: "Calcium Carbonate + D3", ingredients: "Calcium Carbonate eq. to Elemental Calcium 500mg, Vitamin D3 250IU", category: "TABLET", price: 120, manufacturer: "Elder Pharma", uses: "Calcium deficiency, osteoporosis, bone strength", requiresPrescription: false },
  { name: "Iron + Folic Acid", genericName: "Ferrous Sulphate + Folic Acid", ingredients: "Ferrous Sulphate eq. to Elemental Iron 100mg, Folic Acid 0.5mg", category: "TABLET", price: 30, manufacturer: "Alkem", uses: "Iron deficiency anemia, pregnancy support", requiresPrescription: false },
  { name: "Multivitamin (A to Z)", genericName: "Multivitamin Multimineral", ingredients: "Vitamin A, C, D, E, B-Complex, Zinc, Selenium, Iron, Calcium, Magnesium", category: "TABLET", price: 85, manufacturer: "Abbott", uses: "Nutritional supplement, overall health", requiresPrescription: false },
  { name: "Omega-3 Fish Oil 1000mg", genericName: "Fish Oil EPA DHA", ingredients: "Fish Oil 1000mg (EPA 180mg, DHA 120mg), Gelatin, Glycerin", category: "CAPSULE", price: 250, manufacturer: "HealthVit", uses: "Heart health, brain health, joint lubrication", requiresPrescription: false },
  { name: "Zinc 50mg", genericName: "Zinc Sulphate", ingredients: "Zinc Sulphate Monohydrate IP eq. to Elemental Zinc 50mg", category: "TABLET", price: 55, manufacturer: "Cipla", uses: "Zinc deficiency, immune support, wound healing", requiresPrescription: false },
  { name: "Biotin 10000mcg", genericName: "Biotin", ingredients: "D-Biotin 10000mcg, Microcrystalline Cellulose, Gelatin", category: "CAPSULE", price: 350, manufacturer: "HealthKart", uses: "Hair growth, nail strength, skin health", requiresPrescription: false },

  // ── Skin & Dermatology ──
  { name: "Betamethasone Cream", genericName: "Betamethasone Valerate", ingredients: "Betamethasone Valerate IP 0.1% w/w, Cetomacrogol, Chlorocresol", category: "OINTMENT", price: 55, manufacturer: "GSK", uses: "Eczema, dermatitis, skin inflammation, itching", requiresPrescription: true },
  { name: "Clotrimazole Cream 1%", genericName: "Clotrimazole", ingredients: "Clotrimazole IP 1% w/w, Cetostearyl Alcohol, White Soft Paraffin", category: "OINTMENT", price: 45, manufacturer: "Bayer", uses: "Fungal skin infections, ringworm, athlete's foot", requiresPrescription: false },
  { name: "Mupirocin Ointment 2%", genericName: "Mupirocin", ingredients: "Mupirocin IP 2% w/w, Polyethylene Glycol Base", category: "OINTMENT", price: 120, manufacturer: "GSK", uses: "Bacterial skin infections, impetigo, wounds", requiresPrescription: true },
  { name: "Diclofenac Gel 1%", genericName: "Diclofenac Diethylamine", ingredients: "Diclofenac Diethylamine IP eq. to Diclofenac Sodium 1%, Propylene Glycol", category: "OINTMENT", price: 65, manufacturer: "Novartis", uses: "Joint pain, muscle pain, sprains, backache", requiresPrescription: false },
  { name: "Clobetasol Cream 0.05%", genericName: "Clobetasol Propionate", ingredients: "Clobetasol Propionate IP 0.05% w/w, Cetostearyl Alcohol", category: "OINTMENT", price: 75, manufacturer: "Glenmark", uses: "Severe eczema, psoriasis, dermatitis", requiresPrescription: true },
  { name: "Ketoconazole Cream 2%", genericName: "Ketoconazole", ingredients: "Ketoconazole IP 2% w/w, Stearyl Alcohol, Propylene Glycol", category: "OINTMENT", price: 85, manufacturer: "Cipla", uses: "Fungal infections, dandruff, seborrheic dermatitis", requiresPrescription: false },
  { name: "Adapalene Gel 0.1%", genericName: "Adapalene", ingredients: "Adapalene IP 0.1% w/w, Carbomer, Propylene Glycol, Poloxamer", category: "OINTMENT", price: 180, manufacturer: "Galderma", uses: "Acne treatment, blackheads, whiteheads", requiresPrescription: true },

  // ── Eye & Ear Drops ──
  { name: "Ciprofloxacin Eye Drops", genericName: "Ciprofloxacin 0.3%", ingredients: "Ciprofloxacin HCl IP eq. to Ciprofloxacin 0.3% w/v, Benzalkonium Chloride", category: "DROPS", price: 45, manufacturer: "Cipla", uses: "Bacterial eye infections, conjunctivitis", requiresPrescription: true },
  { name: "Tobramycin Eye Drops", genericName: "Tobramycin 0.3%", ingredients: "Tobramycin IP 0.3% w/v, Benzalkonium Chloride, Boric Acid", category: "DROPS", price: 65, manufacturer: "Sun Pharma", uses: "External eye infections", requiresPrescription: true },
  { name: "Lubricant Eye Drops", genericName: "Carboxymethylcellulose", ingredients: "Carboxymethylcellulose Sodium 0.5% w/v, Sodium Chloride, Boric Acid", category: "DROPS", price: 80, manufacturer: "Allergan", uses: "Dry eyes, eye irritation, computer eye strain", requiresPrescription: false },
  { name: "Neomycin Ear Drops", genericName: "Neomycin + Beclomethasone", ingredients: "Neomycin Sulphate 0.5%, Beclomethasone 0.025%, Clotrimazole 1%", category: "DROPS", price: 55, manufacturer: "FDC", uses: "Ear infections, otitis media, ear pain", requiresPrescription: true },
  { name: "Ofloxacin Ear Drops", genericName: "Ofloxacin 0.3%", ingredients: "Ofloxacin IP 0.3% w/v, Benzalkonium Chloride, Sodium Chloride", category: "DROPS", price: 50, manufacturer: "Cipla", uses: "Bacterial ear infections, otitis externa", requiresPrescription: true },

  // ── Mental Health ──
  { name: "Escitalopram 10mg", genericName: "Escitalopram", ingredients: "Escitalopram Oxalate IP eq. to Escitalopram 10mg, Microcrystalline Cellulose", category: "TABLET", price: 85, manufacturer: "Sun Pharma", uses: "Depression, anxiety disorders, OCD", requiresPrescription: true },
  { name: "Sertraline 50mg", genericName: "Sertraline", ingredients: "Sertraline HCl IP eq. to Sertraline 50mg, Calcium Phosphate", category: "TABLET", price: 95, manufacturer: "Pfizer", uses: "Depression, panic disorder, PTSD, social anxiety", requiresPrescription: true },
  { name: "Alprazolam 0.25mg", genericName: "Alprazolam", ingredients: "Alprazolam IP 0.25mg, Lactose, Maize Starch, Magnesium Stearate", category: "TABLET", price: 30, manufacturer: "Torrent", uses: "Anxiety, panic attacks (short-term use)", requiresPrescription: true },
  { name: "Clonazepam 0.5mg", genericName: "Clonazepam", ingredients: "Clonazepam IP 0.5mg, Lactose, Maize Starch, Talc", category: "TABLET", price: 35, manufacturer: "Abbott", uses: "Seizures, panic disorder, anxiety", requiresPrescription: true },
  { name: "Melatonin 3mg", genericName: "Melatonin", ingredients: "Melatonin 3mg, Microcrystalline Cellulose, Stearic Acid", category: "TABLET", price: 250, manufacturer: "Nature's Bounty", uses: "Sleep disorders, jet lag, insomnia", requiresPrescription: false },

  // ── Thyroid ──
  { name: "Thyroxine 50mcg", genericName: "Levothyroxine", ingredients: "Levothyroxine Sodium IP 50mcg, Calcium Phosphate, Starch", category: "TABLET", price: 40, manufacturer: "Abbott", uses: "Hypothyroidism, thyroid hormone replacement", requiresPrescription: true },
  { name: "Thyroxine 100mcg", genericName: "Levothyroxine", ingredients: "Levothyroxine Sodium IP 100mcg, Lactose, Magnesium Stearate", category: "TABLET", price: 55, manufacturer: "Abbott", uses: "Hypothyroidism (higher dose)", requiresPrescription: true },

  // ── Women's Health ──
  { name: "Mefenamic Acid 500mg", genericName: "Mefenamic Acid", ingredients: "Mefenamic Acid IP 500mg, Starch, Povidone, Talc", category: "TABLET", price: 40, manufacturer: "Blue Cross", uses: "Menstrual cramps, period pain, mild to moderate pain", requiresPrescription: true },
  { name: "Norethisterone 5mg", genericName: "Norethisterone", ingredients: "Norethisterone IP 5mg, Lactose, Maize Starch", category: "TABLET", price: 50, manufacturer: "Cipla", uses: "Irregular periods, endometriosis, period delay", requiresPrescription: true },
  { name: "Drospirenone + Ethinyl Estradiol", genericName: "Oral Contraceptive", ingredients: "Drospirenone 3mg, Ethinyl Estradiol 0.03mg, Lactose, Povidone", category: "TABLET", price: 350, manufacturer: "Bayer", uses: "Birth control, PCOS, acne in women", requiresPrescription: true },
  { name: "Progesterone 200mg", genericName: "Progesterone", ingredients: "Progesterone IP 200mg, Peanut Oil, Gelatin, Glycerin", category: "CAPSULE", price: 180, manufacturer: "Sun Pharma", uses: "Hormonal support, infertility, menstrual disorders", requiresPrescription: true },

  // ── Bone & Joint ──
  { name: "Glucosamine 1500mg", genericName: "Glucosamine Sulphate", ingredients: "Glucosamine Sulphate 1500mg, Chondroitin 1200mg, Vitamin C 60mg", category: "TABLET", price: 280, manufacturer: "Intas", uses: "Joint health, osteoarthritis, cartilage repair", requiresPrescription: false },
  { name: "Diclofenac + Serratiopeptidase", genericName: "Diclofenac + Serratiopeptidase", ingredients: "Diclofenac Sodium 50mg, Serratiopeptidase 10mg", category: "TABLET", price: 55, manufacturer: "Abbott", uses: "Pain with swelling, post-surgical inflammation", requiresPrescription: true },
  { name: "Allopurinol 100mg", genericName: "Allopurinol", ingredients: "Allopurinol IP 100mg, Lactose, Maize Starch, Povidone", category: "TABLET", price: 25, manufacturer: "Zydus", uses: "Gout, high uric acid, kidney stones", requiresPrescription: true },
  { name: "Colchicine 0.5mg", genericName: "Colchicine", ingredients: "Colchicine IP 0.5mg, Lactose, Starch, Magnesium Stearate", category: "TABLET", price: 35, manufacturer: "Abbott", uses: "Acute gout attack, gout prevention", requiresPrescription: true },
  { name: "Calcitonin Nasal Spray", genericName: "Salmon Calcitonin", ingredients: "Salmon Calcitonin 200IU/spray, Sodium Chloride, Benzalkonium Chloride", category: "OTHER", price: 650, manufacturer: "Novartis", uses: "Osteoporosis, bone pain, Paget's disease", requiresPrescription: true },

  // ── Oral Care ──
  { name: "Metrogyl DG Gel", genericName: "Metronidazole + Chlorhexidine", ingredients: "Metronidazole Benzoate 1%, Chlorhexidine Gluconate 0.25%", category: "OINTMENT", price: 80, manufacturer: "Blue Cross", uses: "Gum disease, gingivitis, dental infections, mouth ulcers", requiresPrescription: false },

  // ── Anti-Worm ──
  { name: "Albendazole 400mg", genericName: "Albendazole", ingredients: "Albendazole IP 400mg, Maize Starch, Sodium Starch Glycolate, Talc", category: "TABLET", price: 15, manufacturer: "GSK", uses: "Worm infections, roundworm, hookworm, tapeworm", requiresPrescription: false },
  { name: "Ivermectin 12mg", genericName: "Ivermectin", ingredients: "Ivermectin IP 12mg, Microcrystalline Cellulose, Starch", category: "TABLET", price: 65, manufacturer: "Mankind", uses: "Parasitic infections, scabies, strongyloides", requiresPrescription: true },

  // ── Anti-fungal ──
  { name: "Fluconazole 150mg", genericName: "Fluconazole", ingredients: "Fluconazole IP 150mg, Lactose, Maize Starch, Talc", category: "CAPSULE", price: 45, manufacturer: "Pfizer", uses: "Fungal infections, candidiasis, thrush", requiresPrescription: true },
  { name: "Terbinafine 250mg", genericName: "Terbinafine", ingredients: "Terbinafine HCl IP 250mg, Microcrystalline Cellulose, Sodium Starch", category: "TABLET", price: 120, manufacturer: "Novartis", uses: "Nail fungal infections, skin fungal infections", requiresPrescription: true },
  { name: "Itraconazole 100mg", genericName: "Itraconazole", ingredients: "Itraconazole IP 100mg, Sugar Spheres, HPMC", category: "CAPSULE", price: 150, manufacturer: "Cipla", uses: "Systemic fungal infections, aspergillosis", requiresPrescription: true },

  // ── Surgical & First Aid ──
  { name: "Povidone Iodine 5%", genericName: "Povidone Iodine", ingredients: "Povidone-Iodine IP 5% w/v, Purified Water", category: "SURGICAL", price: 55, manufacturer: "Win-Medicare", uses: "Wound cleaning, antiseptic, pre-surgery skin prep", requiresPrescription: false },
  { name: "Silver Sulfadiazine Cream", genericName: "Silver Sulfadiazine 1%", ingredients: "Silver Sulfadiazine IP 1% w/w, White Soft Paraffin, Cetyl Alcohol", category: "OINTMENT", price: 80, manufacturer: "Dr. Reddy's", uses: "Burn wound treatment, infection prevention", requiresPrescription: true },
  { name: "Soframycin Skin Cream", genericName: "Framycetin Sulphate", ingredients: "Framycetin Sulphate IP 1% w/w, Stearic Acid, Cetyl Alcohol", category: "OINTMENT", price: 55, manufacturer: "Sanofi", uses: "Minor cuts, burns, bacterial skin infections", requiresPrescription: false },
  { name: "ORS Powder", genericName: "Oral Rehydration Salts", ingredients: "Sodium Chloride 2.6g, Potassium Chloride 1.5g, Sodium Citrate 2.9g, Glucose 13.5g", category: "OTC", price: 15, manufacturer: "WHO Standard", uses: "Dehydration, diarrhea, vomiting, fluid loss", requiresPrescription: false },
  { name: "Electral Powder", genericName: "Electrolyte Replacement", ingredients: "Sodium Chloride, Potassium Chloride, Sodium Citrate, Dextrose", category: "OTC", price: 22, manufacturer: "FDC", uses: "Dehydration, electrolyte imbalance, heat stroke", requiresPrescription: false },

  // ── Liver & Kidney ──
  { name: "Ursodeoxycholic Acid 300mg", genericName: "Ursodiol", ingredients: "Ursodeoxycholic Acid IP 300mg, Maize Starch, Talc", category: "TABLET", price: 140, manufacturer: "Sun Pharma", uses: "Gallstones, liver protection, cholestasis", requiresPrescription: true },
  { name: "Silymarin 140mg", genericName: "Milk Thistle Extract", ingredients: "Silymarin (from Milk Thistle) 140mg, Microcrystalline Cellulose", category: "CAPSULE", price: 180, manufacturer: "Micro Labs", uses: "Liver protection, hepatitis support, fatty liver", requiresPrescription: false },

  // ── Miscellaneous ──
  { name: "Methylcobalamin 1500mcg", genericName: "Methylcobalamin", ingredients: "Methylcobalamin IP 1500mcg, Mannitol, Povidone", category: "TABLET", price: 90, manufacturer: "Abbott", uses: "Vitamin B12 deficiency, neuropathy, nerve pain", requiresPrescription: false },
  { name: "Pregabalin 75mg", genericName: "Pregabalin", ingredients: "Pregabalin IP 75mg, Lactose, Maize Starch, Talc", category: "CAPSULE", price: 110, manufacturer: "Sun Pharma", uses: "Nerve pain, neuropathy, fibromyalgia, epilepsy", requiresPrescription: true },
  { name: "Gabapentin 300mg", genericName: "Gabapentin", ingredients: "Gabapentin IP 300mg, Lactose, Maize Starch, Talc", category: "CAPSULE", price: 85, manufacturer: "Pfizer", uses: "Nerve pain, epilepsy, neuropathic pain", requiresPrescription: true },
  { name: "Loperamide 2mg", genericName: "Loperamide", ingredients: "Loperamide HCl IP 2mg, Lactose, Maize Starch, Talc", category: "CAPSULE", price: 25, manufacturer: "Johnson & Johnson", uses: "Diarrhea, traveler's diarrhea", requiresPrescription: false },
  { name: "Bisacodyl 5mg", genericName: "Bisacodyl", ingredients: "Bisacodyl IP 5mg, Lactose, Starch, Talc, Acacia", category: "TABLET", price: 20, manufacturer: "Dr. Reddy's", uses: "Constipation, bowel preparation", requiresPrescription: false },
  { name: "Lactulose Syrup", genericName: "Lactulose", ingredients: "Lactulose Solution IP 10g/15ml", category: "SYRUP", price: 110, manufacturer: "Abbott", uses: "Chronic constipation, hepatic encephalopathy", requiresPrescription: false },
  { name: "Isotretinoin 20mg", genericName: "Isotretinoin", ingredients: "Isotretinoin IP 20mg, Soybean Oil, Beeswax, Hydrogenated Vegetable Oil", category: "CAPSULE", price: 200, manufacturer: "Cipla", uses: "Severe acne, cystic acne", requiresPrescription: true },
  { name: "Finasteride 1mg", genericName: "Finasteride", ingredients: "Finasteride IP 1mg, Lactose, Cellulose, Starch, Iron Oxide", category: "TABLET", price: 180, manufacturer: "MSD", uses: "Male pattern hair loss", requiresPrescription: true },
  { name: "Minoxidil Solution 5%", genericName: "Minoxidil", ingredients: "Minoxidil USP 5% w/v, Alcohol, Propylene Glycol, Water", category: "OTHER", price: 450, manufacturer: "Dr. Reddy's", uses: "Hair loss treatment, alopecia", requiresPrescription: false },
  { name: "Tadalafil 10mg", genericName: "Tadalafil", ingredients: "Tadalafil IP 10mg, Lactose, Croscarmellose Sodium, HPMC", category: "TABLET", price: 250, manufacturer: "Cipla", uses: "Erectile dysfunction, pulmonary hypertension", requiresPrescription: true },
];

export const MEDICINE_CATEGORIES = [
  "All", "TABLET", "CAPSULE", "SYRUP", "INJECTION", "OINTMENT", "DROPS", "OTC", "SURGICAL", "OTHER",
];

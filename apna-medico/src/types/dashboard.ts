export interface BedInfo {
  id: string;
  hospitalId: string;
  totalEmergencyBeds: number;
  availableEmergencyBeds: number;
  totalIcuBeds: number;
  availableIcuBeds: number;
  totalGeneralBeds: number;
  availableGeneralBeds: number;
  ventilators: number;
  lastUpdatedBy: string | null;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string | null;
  license: string | null;
  specialties: string[];
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  isActive: boolean;
  imageUrl: string | null;
  bedInfo: BedInfo | null;
}

export interface HospitalStaff {
  id: string;
  userId: string;
  hospitalId: string;
  designation: string;
  specialization: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  isOnDuty: boolean;
  hospital: Hospital;
}

export interface AmbulanceDriver {
  id: string;
  userId: string;
  vehicleNumber: string;
  vehicleType: string;
  licenseNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
}

export interface MedicalStore {
  id: string;
  userId: string;
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  license: string | null;
  isOpen: boolean;
  isVerified: boolean;
  deliveryRadius: number;
  rating: number;
  totalRatings: number;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string[];
  currentMedications: string[];
  medicalHistory: string | null;
  emergencyContact: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DashboardUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  patient: Patient | null;
  hospitalStaff: HospitalStaff | null;
  ambulanceDriver: AmbulanceDriver | null;
  medicalStore: MedicalStore | null;
}

// Mock data store for the TAAS application
export interface Customer {
  customer_code: string;
  customer_name: string;
  mobile_number: string;
  email: string;
  city: string;
  vehicle_number: string;
  vehicle_make_model: string;
  tyre_details: string;
  invoice_number: string;
  registration_date: string;
  dealer_code: string;
}

export interface Dealer {
  dealer_code: string;
  dealer_name: string;
  dealer_mobile_number: string;
  dealer_email: string;
  dealer_city: string;
  dealer_state: string;
  dealer_status: string;
  dealer_enrollment_date: string;
}

export interface Subscription {
  order_id: string;
  customer_code: string;
  customer_name: string;
  customer_mobile?: string;
  dealer_code: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  payment_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  order_timestamp: string;
}

export interface PlanBenefit {
  name: string;
  icon: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  duration: string;
  validity: string;
  totalServices: number;
  features: string[];
  benefits: PlanBenefit[];
  recommended?: boolean;
}

const benefitSet = (towing: boolean, hotel: boolean, cab: boolean, ambulance: boolean, legal: boolean): PlanBenefit[] => [
  { name: "Towing", icon: "🚜", included: towing },
  { name: "Hotel", icon: "🏨", included: hotel },
  { name: "Cab Facility", icon: "🚕", included: cab },
  { name: "Ambulance", icon: "🚑", included: ambulance },
  { name: "Legal Assistance", icon: "📞", included: legal },
];

export const plans: Plan[] = [
  {
    id: "PLAN_SILVER",
    name: "Silver Assistance Plan",
    price: 93,
    priceLabel: "₹93 incl. GST",
    duration: "2 Years",
    validity: "2 Years",
    totalServices: 3,
    features: [
      "3 Roadside Assistance Services",
      "2 Year Validity",
      "Towing Service",
      "Ambulance Support",
      "Legal Assistance",
    ],
    benefits: benefitSet(true, false, false, true, true),
  },
  {
    id: "PLAN_GOLD",
    name: "Gold Assistance Plan",
    price: 123,
    priceLabel: "₹123 incl. GST",
    duration: "2 Years",
    validity: "2 Years",
    totalServices: 3,
    features: [
      "3 Roadside Assistance Services",
      "2 Year Validity",
      "Towing Service",
      "Ambulance Support",
      "Cab Facility",
      "Legal Assistance",
    ],
    benefits: benefitSet(true, false, true, true, true),
    recommended: true,
  },
  {
    id: "PLAN_PLATINUM",
    name: "Platinum Assistance Plan",
    price: 152,
    priceLabel: "₹152 incl. GST",
    duration: "2 Years",
    validity: "2 Years",
    totalServices: 3,
    features: [
      "3 Roadside Assistance Services",
      "2 Year Validity",
      "Towing Service",
      "Hotel Accommodation",
      "Cab Facility",
      "Ambulance Support",
      "Legal Assistance",
    ],
    benefits: benefitSet(true, true, true, true, true),
  },
];

export const mockCustomers: Customer[] = [
  {
    customer_code: "CUS78901",
    customer_name: "Ravi Kumar",
    mobile_number: "9876543210",
    email: "ravi@gmail.com",
    city: "Pune",
    vehicle_number: "MH12AB1234",
    vehicle_make_model: "Tata Ace",
    tyre_details: "BKT Agrimax RT657",
    invoice_number: "INV2345",
    registration_date: "2026-02-10",
    dealer_code: "DLR12345",
  },
  {
    customer_code: "CUS78902",
    customer_name: "Suresh Patel",
    mobile_number: "9876543212",
    email: "suresh@gmail.com",
    city: "Mumbai",
    vehicle_number: "MH01CD5678",
    vehicle_make_model: "Mahindra Bolero",
    tyre_details: "BKT AT171",
    invoice_number: "INV2346",
    registration_date: "2026-02-11",
    dealer_code: "DLR12345",
  },
  {
    customer_code: "CUS78903",
    customer_name: "Anjali Sharma",
    mobile_number: "9876543213",
    email: "anjali@gmail.com",
    city: "Delhi",
    vehicle_number: "DL08EF9012",
    vehicle_make_model: "Ashok Leyland Dost",
    tyre_details: "BKT Earthmax SR41",
    invoice_number: "INV2347",
    registration_date: "2026-02-12",
    dealer_code: "DLR12346",
  },
];

export const mockDealers: Dealer[] = [
  {
    dealer_code: "DLR12345",
    dealer_name: "Sharma Tyres",
    dealer_mobile_number: "9876543211",
    dealer_email: "sharmatyres@gmail.com",
    dealer_city: "Pune",
    dealer_state: "Maharashtra",
    dealer_status: "ACTIVE",
    dealer_enrollment_date: "2026-01-15",
  },
  {
    dealer_code: "DLR12346",
    dealer_name: "Delhi Auto Works",
    dealer_mobile_number: "9876543214",
    dealer_email: "delhiauto@gmail.com",
    dealer_city: "Delhi",
    dealer_state: "Delhi",
    dealer_status: "ACTIVE",
    dealer_enrollment_date: "2026-02-01",
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    order_id: "ORD45678",
    customer_code: "CUS78901",
    customer_name: "Ravi Kumar",
    customer_mobile: "9876543210",
    dealer_code: "DLR12345",
    plan_id: "PLAN_GOLD",
    plan_name: "Gold Assistance Plan",
    plan_price: 1499,
    payment_status: "SUCCESS",
    subscription_start_date: "2026-02-10",
    subscription_end_date: "2027-02-09",
    order_timestamp: "2026-02-10T11:15:00Z",
  },
  {
    order_id: "ORD45679",
    customer_code: "CUS78902",
    customer_name: "Suresh Patel",
    customer_mobile: "9876543212",
    dealer_code: "DLR12345",
    plan_id: "PLAN_SILVER",
    plan_name: "Silver Assistance Plan",
    plan_price: 799,
    payment_status: "SUCCESS",
    subscription_start_date: "2026-02-11",
    subscription_end_date: "2026-08-10",
    order_timestamp: "2026-02-11T14:30:00Z",
  },
];

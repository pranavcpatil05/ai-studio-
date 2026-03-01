export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TaxDeduction {
  category: string;
  amount: number;
  description: string;
  section: string;
  justification: string;
}

export interface TaxSummary {
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
  potentialSavings: number;
  oldRegimeTax: number;
  newRegimeTax: number;
  suggestedRegime: 'old' | 'new';
  suggestedITR: string;
}

export interface ExtractionResult {
  incomeSources: { source: string; amount: number }[];
  deductions: TaxDeduction[];
  summary: string;
}

export interface QuizResponse {
  category: 'individual' | 'huf';
  residency: 'resident' | 'nri' | 'rnor';
  incomeRange: 'up_to_50l' | '50l_to_75l' | 'above_75l';
  incomeSources: string[];
  housePropertyCount: 'zero' | 'one' | 'more_than_one';
  agriIncome: 'none' | 'up_to_5k' | 'more_than_5k';
  specialDisclosures: string[];
}

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
}


export interface Company {
  id: string;
  name: string;
  email: string;
}

export interface OfferRequest {
  id: string;
  title: string;
  description: string;
  keywords: string; // For AI generation
  requirements: string;
  dueDate: string; // ISO date string
  status: 'Pending' | 'Submissions Open' | 'Evaluating' | 'Closed';
  companies: Company[];
  createdAt: string; // ISO date string
}

export interface OfferRequestFormData {
  title: string;
  description: string;
  keywords: string;
  requirements: string;
  dueDate: string;
  companies: Array<{ name: string; email: string }>;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  mockUrl: string; // Simulated URL from Dropbox
  content?: string; // Base64 content for Gemini, if applicable (not used in this version for simplicity)
}

export interface OfferSubmission {
  id: string;
  offerRequestId: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  offerDetails: string;
  pricing: string; // Could be a complex object or simple text
  attachments: Attachment[];
  submittedAt: string; // ISO date string
  status: 'Submitted' | 'Viewed' | 'Shortlisted' | 'Rejected';
}

export interface OfferSubmissionFormData {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  offerDetails: string;
  pricing: string;
  // Files will be handled separately and converted to Attachments
}
    
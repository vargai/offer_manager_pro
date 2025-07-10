
import { OfferRequest, OfferSubmission, Company, Attachment } from '../types';

const OFFER_REQUESTS_KEY = 'offerRequests';
const OFFER_SUBMISSIONS_KEY = 'offerSubmissions';

const getOfferRequestsFromStorage = (): OfferRequest[] => {
  const data = localStorage.getItem(OFFER_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOfferRequestsToStorage = (requests: OfferRequest[]): void => {
  localStorage.setItem(OFFER_REQUESTS_KEY, JSON.stringify(requests));
};

const getOfferSubmissionsFromStorage = (): OfferSubmission[] => {
  const data = localStorage.getItem(OFFER_SUBMISSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOfferSubmissionsToStorage = (submissions: OfferSubmission[]): void => {
  localStorage.setItem(OFFER_SUBMISSIONS_KEY, JSON.stringify(submissions));
};

export const OfferService = {
  generateId: (): string => Math.random().toString(36).substr(2, 9),

  async createOfferRequest(requestData: Omit<OfferRequest, 'id' | 'status' | 'createdAt' | 'companies'> & { companies: Array<{ name: string; email: string }> }): Promise<OfferRequest> {
    const requests = getOfferRequestsFromStorage();
    const newRequest: OfferRequest = {
      ...requestData,
      id: this.generateId(),
      status: 'Submissions Open',
      createdAt: new Date().toISOString(),
      companies: requestData.companies.map(c => ({ ...c, id: this.generateId() })),
    };
    requests.push(newRequest);
    saveOfferRequestsToStorage(requests);

    // Simulate sending emails
    console.log(`Offer Request "${newRequest.title}" created.`);
    newRequest.companies.forEach(company => {
      const submissionLink = `${window.location.origin}${window.location.pathname}#/submit-offer/${newRequest.id}`;
      console.log(`Simulating email to ${company.email}:`);
      console.log(`Subject: Invitation to Submit Offer: ${newRequest.title}`);
      console.log(`Body: Dear ${company.name}, please submit your offer using this link: ${submissionLink}`);
      alert(`Mock email link for ${company.name} (${company.email}): ${submissionLink} (Check console for details)`);
    });
    
    return newRequest;
  },

  async getOfferRequests(): Promise<OfferRequest[]> {
    return getOfferRequestsFromStorage().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOfferRequestById(id: string): Promise<OfferRequest | undefined> {
    return getOfferRequestsFromStorage().find(req => req.id === id);
  },

  async submitOffer(offerRequestId: string, submissionData: Omit<OfferSubmission, 'id' | 'offerRequestId' | 'submittedAt' | 'status' | 'attachments'>, files: File[]): Promise<OfferSubmission> {
    const submissions = getOfferSubmissionsFromStorage();
    const newSubmissionId = this.generateId();

    const attachments: Attachment[] = files.map(file => {
      const attachmentId = this.generateId();
      // Simulate Dropbox upload
      const mockUrl = `dropbox-mock-link/${newSubmissionId}/${attachmentId}/${file.name}`;
      console.log(`Simulating Dropbox upload: File "${file.name}" uploaded to "${mockUrl}"`);
      return {
        id: attachmentId,
        name: file.name,
        type: file.type,
        size: file.size,
        mockUrl: mockUrl,
      };
    });

    const newSubmission: OfferSubmission = {
      ...submissionData,
      id: newSubmissionId,
      offerRequestId: offerRequestId,
      attachments: attachments,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
    };
    submissions.push(newSubmission);
    saveOfferSubmissionsToStorage(submissions);

    // Optionally, update the status of the OfferRequest
    const requests = getOfferRequestsFromStorage();
    const requestIndex = requests.findIndex(req => req.id === offerRequestId);
    if (requestIndex > -1) {
      // Could add logic here to change request status, e.g. if all companies submitted.
      // For now, just log.
      console.log(`Offer submitted for request ID: ${offerRequestId} by ${submissionData.companyName}`);
      // saveOfferRequestsToStorage(requests); // if requests was modified
    }
    
    return newSubmission;
  },

  async getSubmissionsForRequest(offerRequestId: string): Promise<OfferSubmission[]> {
    return getOfferSubmissionsFromStorage()
      .filter(sub => sub.offerRequestId === offerRequestId)
      .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  async updateOfferRequestStatus(offerRequestId: string, status: OfferRequest['status']): Promise<OfferRequest | undefined> {
    const requests = getOfferRequestsFromStorage();
    const requestIndex = requests.findIndex(req => req.id === offerRequestId);
    if (requestIndex > -1) {
      requests[requestIndex].status = status;
      saveOfferRequestsToStorage(requests);
      return requests[requestIndex];
    }
    return undefined;
  },

  async updateOfferSubmissionStatus(submissionId: string, status: OfferSubmission['status']): Promise<OfferSubmission | undefined> {
    const submissions = getOfferSubmissionsFromStorage();
    const submissionIndex = submissions.findIndex(sub => sub.id === submissionId);
    if (submissionIndex > -1) {
      submissions[submissionIndex].status = status;
      saveOfferSubmissionsToStorage(submissions);
      return submissions[submissionIndex];
    }
    return undefined;
  }
};
    
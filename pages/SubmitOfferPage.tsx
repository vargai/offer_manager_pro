
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OfferRequest, OfferSubmissionFormData } from '../types';
import { OfferService } from '../services/OfferService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UploadIcon, PaperClipIcon, TrashIcon } from '../components/common/Icons';

const SubmitOfferPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [offerRequest, setOfferRequest] = useState<OfferRequest | null>(null);
  const [formData, setFormData] = useState<OfferSubmissionFormData>({
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    offerDetails: '',
    pricing: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const request = await OfferService.getOfferRequestById(requestId);
      if (request) {
        if (request.status === 'Closed') {
            alert("This offer request is closed and no longer accepting submissions.");
            navigate('/'); // Redirect if closed
            return;
        }
        setOfferRequest(request);
      } else {
        alert("Offer request not found.");
        navigate('/'); // Redirect if not found
      }
    } catch (error) {
      console.error("Failed to fetch offer request details:", error);
      alert("Error: Could not load offer request details.");
    } finally {
      setIsLoading(false);
    }
  }, [requestId, navigate]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit total files or size if necessary
      if (files.length + newFiles.length > 5) {
        alert("You can upload a maximum of 5 files.");
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requestId) return;

    if (!formData.companyName || !formData.contactEmail || !formData.offerDetails) {
        alert("Please fill in all required fields: Company Name, Contact Email, and Offer Details.");
        return;
    }

    setIsSubmitting(true);
    try {
      await OfferService.submitOffer(requestId, formData, files);
      alert('Offer submitted successfully! Thank you.');
      navigate('/'); // Or a thank you page
    } catch (error) {
      console.error("Failed to submit offer:", error);
      alert("Error: Could not submit your offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!offerRequest) {
    return <div className="text-center text-red-500 py-10">Offer request not found or access denied.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Submit Offer For: {offerRequest.title}</h1>
        <p className="text-sm text-gray-600 mb-1"><strong className="font-medium">Description:</strong> {offerRequest.description}</p>
        <p className="text-sm text-gray-600 mb-1"><strong className="font-medium">Requirements:</strong> {offerRequest.requirements}</p>
        <p className="text-sm text-gray-500"><strong className="font-medium">Due Date:</strong> {new Date(offerRequest.dueDate).toLocaleDateString()}</p>
      </div>
      
      <h2 className="text-xl font-semibold text-slate-700 mb-6">Your Offer Submission</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Your Company Ltd."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                    type="text"
                    name="contactPerson"
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Jane Doe"
                />
            </div>
            <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
                <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="jane.doe@example.com"
                />
            </div>
        </div>
        
        <div>
          <label htmlFor="offerDetails" className="block text-sm font-medium text-gray-700 mb-1">Offer Details <span className="text-red-500">*</span></label>
          <textarea
            name="offerDetails"
            id="offerDetails"
            rows={5}
            value={formData.offerDetails}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Provide a detailed description of your offer, how it meets the requirements, and any unique selling points."
          ></textarea>
        </div>

        <div>
          <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">Pricing Information</label>
          <textarea
            name="pricing"
            id="pricing"
            rows={3}
            value={formData.pricing}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Detail your pricing structure, payment terms, etc."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Max 5 files)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500"
                >
                  <span>Upload files</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG, ZIP up to 10MB each</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
              <ul className="list-disc list-inside pl-2 space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="inline-flex items-center">
                        <PaperClipIcon className="w-4 h-4 mr-2 text-gray-400"/>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button type="button" onClick={() => removeFile(file.name)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || offerRequest.status === 'Closed'}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 transition-all duration-150 ease-in-out"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : (offerRequest.status === 'Closed' ? 'Submissions Closed' : 'Submit Offer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitOfferPage;
    
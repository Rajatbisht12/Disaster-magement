import React, { useState } from 'react';
import * as api from '../services/api';

const ReportForm = ({ disasterId, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    content: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disasterId) {
      alert('Please select a disaster first');
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify the image if provided
      if (formData.image_url) {
        const verifyRes = await api.verifyImage(disasterId, formData.image_url);
        setVerificationResult(verifyRes.data);
      }

      // Submit the report
      const reportData = {
        disaster_id: disasterId,
        content: formData.content,
        image_url: formData.image_url,
        verification_status: verificationResult?.verified ? 'verified' : 'pending'
      };

      // Note: You'll need to add this API endpoint to your backend
      // await api.submitReport(reportData);
      
      console.log('Report submitted:', reportData);
      setFormData({ content: '', image_url: '' });
      setVerificationResult(null);
      onReportSubmitted && onReportSubmitted();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!disasterId) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p>Please select a disaster to submit a report.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px', marginBottom: '20px' }}>
      <h3>Submit Report</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Describe what you're seeing..."
            required
            rows="4"
          />
        </div>
        <div>
          <label>Image URL (optional):</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {verificationResult && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: verificationResult.verified ? '#d4edda' : '#f8d7da',
            borderRadius: '3px',
            marginTop: '10px'
          }}>
            <strong>Image Verification:</strong> {verificationResult.verified ? 'Verified' : 'Pending Review'}
            {verificationResult.reason && <p>{verificationResult.reason}</p>}
          </div>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm; 
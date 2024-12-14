export const validateCampaignForm = (formData) => {
    const errors = {};
  
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
  
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
  
    if (!formData.target || formData.target <= 0) {
      errors.target = 'Target amount must be greater than 0';
    }
  
    if (!formData.deadline) {
      errors.deadline = 'End date is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        errors.deadline = 'End date must be in the future';
      }
    }
  
    if (!formData.image) {
      errors.image = 'Campaign image is required';
    }
  
    return errors;
  };
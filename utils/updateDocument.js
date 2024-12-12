const mongoose = require('mongoose');
const Tour = require('./tourModel');

const updateExistingDocuments = async () => {
  try {
    // Update all documents that do not have the `isDeleted` field
    await Tour.updateMany(
      { isDeleted: { $exists: false } }, // Only update documents where isDeleted is missing
      { $set: { isDeleted: false } }     // Set isDeleted to false
    );
    console.log('Updated all existing documents with isDeleted field');
  } catch (err) {
    console.error('Error updating documents:', err);
  }
};

// Call the function
// updateExistingDocuments();

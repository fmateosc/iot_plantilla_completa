const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  userId: { type: String },
  company: { type: String },
  avatar: { type: String },
  jobTitle  : { type: String },
  firstName : { type: String },
  lastName : { type: String },
  address : { type: String },
  city : { type: String },
  country : { type: String },
  postalCode : { type: String },
  phone : { type: String }
});

// convert to model
const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
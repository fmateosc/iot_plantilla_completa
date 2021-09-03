<template>
  <div class="row">
    <div class="col-md-8">
      <card>
        <h5 class="title">Edit Profile</h5>

        <div class="row">
          <!-----------------COMPANY----------------->
          <div class="col-md-5">
            <base-input
              type="text"
              label="Company"
              placeholder="Company"
              v-model="profile.company"
            >
            </base-input>
          </div>

          <!-----------------Name----------------->
          <div class="col-md-3">
            <base-input
              type="text"
              label="Name"
              placeholder="Name"
              :disabled="true"
              v-model="profile.name"
            >
            </base-input>
          </div>

          <!-----------------Email----------------->
          <div class="col-md-4">
            <base-input
              type="email"
              label="Email address"
              placeholder="Emailm"
              v-model="profile.email"
            >
            </base-input>
          </div>
        </div>

        <div class="row">
          <!-----------------FIRST NAME----------------->
          <div class="col-md-6">
            <base-input
              type="text"
              label="First Name"
              placeholder="First Name"
              v-model="profile.firstName"
            >
            </base-input>
          </div>

          <!-----------------LAST NAME----------------->
          <div class="col-md-6">
            <base-input
              type="text"
              label="Last Name"
              placeholder="Last Name"
              v-model="profile.lastName"
            >
            </base-input>
          </div>
        </div>

        <div class="row">
          <!-----------------ADDRESS----------------->
          <div class="col-md-12">
            <base-input
              type="text"
              label="Address"
              placeholder="Home Address"
              v-model="profile.address"
            >
            </base-input>
          </div>
        </div>

        <div class="row">
          <!-----------------CITY----------------->
          <div class="col-md-4">
            <base-input
              type="text"
              label="City"
              placeholder="City"
              v-model="profile.city"
            >
            </base-input>
          </div>
          <!-----------------COUNTRY----------------->
          <div class="col-md-4">
            <base-input
              type="text"
              label="Country"
              placeholder="Country"
              v-model="profile.country"
            >
            </base-input>
          </div>
          <!-----------------ZIP CODE----------------->
          <div class="col-md-4">
            <base-input
              label="Postal Code"
              placeholder="ZIP Code"
              v-model="profile.postalCode"
            >
            </base-input>
          </div>
        </div>

        <!-----------------BUTTON----------------->
        <base-button v-if="!isAdmin" 
          type="primary" 
          class="btn-fill"
          @click="updateProfile()"
        >
          Save
        </base-button>
      </card>
    </div>

    <!---------------------------------------------------------------------------->  
    <div class="col-md-4">
      <card class="card-user">
        <p class="card-text"></p>
        <div class="author">
          <div class="block block-one"></div>
          <div class="block block-two"></div>
          <div class="block block-three"></div>
          <div class="block block-four"></div>
          <a href="javascript:void(0)">
            <img class="avatar" src="img/emilyz.jpg" alt="..." />
            <h5 class="title">{{profile.firstName }}<span style="padding-left:5px"></span>{{ profile.lastName}}</h5>
          </a>
          <p class="description">{{ profile.jobTitle }}</p>
        </div>
        <p></p>
        <div class="card-description">
          Do not be scared of the truth because we need to restart the human
          foundation in truth And I love you like Kanye loves Kanye I love Rick
          Owens’ bed design but the back is...
        </div>

        <div slot="footer" class="button-container">
          <base-button class="btn-facebook" icon round>
            <i class="fab fa-facebook"></i>
          </base-button>
          <base-button class="btn-twitter" icon round>
            <i class="fab fa-twitter"></i>
          </base-button>
          <base-button class="btn-google" icon round>
            <i class="fab fa-google-plus"></i>
          </base-button>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
export default {
  middleware: "authenticated",
  data() {
    return {
      profile: {
        userId: "",
        company: "",
        name: "",
        email: "",
        avatar: "",
        jobTitle: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        phone: ""
      },
      userId: "",
      isAdmin: false
    };
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    //Get profile
    async getProfile() { 
      if(this.$store.state.auth.userData.isAdmin) {
         this.userId = this.$store.state.profileUserId;
         this.isAdmin = true;
      } else {
        this.userId = this.$store.state.auth.userData._id;
        this.isAdmin = false;
      }

      this.userId = this.$store.state.profileUserId;
      
      const toSend = {
        userId: this.$store.state.profileUserId
      };

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      this.$axios
        .post("/profile", toSend, axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {
            this.profile.userId = res.data.profile[0].userId;
            this.profile.company = res.data.profile[0].company;
            this.profile.avatar = res.data.profile[0].avatar;
            this.profile.jobTitle = res.data.profile[0].jobTitle;
            this.profile.firstName = res.data.profile[0].firstName;
            this.profile.lastName = res.data.profile[0].lastName;
            this.profile.address = res.data.profile[0].address;
            this.profile.city = res.data.profile[0].city;
            this.profile.country = res.data.profile[0].country;
            this.profile.postalCode = res.data.profile[0].postalCode;
            this.profile.phone = res.data.profile[0].phone;

            this.profile.name = res.data.user[0].name;
            this.profile.email = res.data.user[0].email;
          }
        })
        .catch(e => {
          console.log(e.response.data);

          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error getting perfile..."
          });

          return;
        });
    },
    //update profile
    async updateProfile() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      this.$axios
        .put("/profile_update", this.profile, axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Profile update..."
            });
            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Email already exists :("
            });

            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error updating profile..."
            });

            return;
          }
        });
    },
  }
};
</script>

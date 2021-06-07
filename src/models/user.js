const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const { Timestamp } = require("bson");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: false,
    },
    age: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    gender: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    prefix: {
      type: Number,
    },
    phone: {
      type: String,
      validate(value) {
        var numbers = /^[0-9]+$/;
        if (!value.toLowerCase().match(numbers)) {
          throw new Error("Phone number should be only numbers");
        }
      },
    },
    dob: {
      type: String,
    },
    skills: {
      type: Array,
    },
    password: {
      type: String,
      trim: true,
      required: true,

      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot be password");
        }
        if (value.length <= 6) {
          throw new Error("Length cannot be less than 6");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    photo: {
      type: Buffer,
      // contentType: String,
    },
  },
  {
    timestamps: true,
  }
);
// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await this.findOne({ email: email })
//   if (!user) {
//     throw new Error('Unable to login')
//   }
//   const isMatch = await bcrypt.compare(password, user.password)
//   if (!isMatch) {
//     throw new Error('Unable to login')
//   }
//   return user
// }
userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};
//Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

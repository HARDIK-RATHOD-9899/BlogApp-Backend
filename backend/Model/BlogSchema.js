const mongoose = require("mongoose");

const BlogSchema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    like: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, require: true, ref: "users" },
    // publishTime : {type : Date, default : Date.now}
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const BlogModel = mongoose.model("blogs", BlogSchema);

module.exports = BlogModel;

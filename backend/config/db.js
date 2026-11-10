const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in backend/.env file");
      process.exit(1);
    }

    if (
      process.env.MONGO_URI.includes("<username>") ||
      process.env.MONGO_URI.includes("<cluster-url>")
    ) {
      console.error(
        "\n❌ [MongoDB Error]: backend/.env me placeholder '<username>' ya '<cluster-url>' hai!\nApna actual MongoDB Atlas connection string backend/.env me dalein.\n"
      );
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("SSL alert number 80") || error.message.includes("tlsv1 alert internal error")) {
      console.error(
        "\n⚠️ [Atlas Network Access]: MongoDB Atlas ne connection reject kiya hai kyunki aapka IP whitelist nahi hai.\n👉 MongoDB Atlas Console me jayein -> 'Network Access' -> 'Add IP Address' -> 'Allow Access from Anywhere (0.0.0.0/0)' add karein.\n"
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        }
        // Agrega aquí los demás campos que necesite el evento
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Event", eventSchema); 
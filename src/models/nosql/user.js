const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            // required: true
        },
        profilePicture: { //URL de PINATA
            type: String,
            // required: true
        },
        email: {
            type: String, 
            unique: true,
            required: true
        },
        password: {
            type: String, 
            select: false
        },
        role: {
            type: String,
            enum: ["sponsor", "event_creator"], 
            default: "event_creator"
        },
        registryDate: {
            type: Date,
            default: Date.now,
            select: false
        },
        step: Number,
        tries: {
            type: Number,
            default: 3
        },
        validationCode: {
            type: Number
        }, 
        validated: {
            type: Boolean,
            default: false
        },
        deleted: { // Usuario eliminado
            type: Boolean,
            default: false
        }
    },
    {
        timestamp: true, 
        versionKey: false
    }
)
module.exports = mongoose.model("users", userSchema) // “users” es el nombre de la colección en mongoDB (o de la tabla en SQL)
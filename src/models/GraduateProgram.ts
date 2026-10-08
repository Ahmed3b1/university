import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IGraduateProgram extends Document {
    title: string
    description: string
    requirements: string
    duration: string
    startDate: Date
    type: 'master' | 'phd'
    coordinator?: Types.ObjectId
    image?: string
    createdAt: Date
    updatedAt: Date
}


const GraduateProgramSchema = new Schema<IGraduateProgram>(
    {
        title:{
            type:String,
            required:[true,""],
            trim:true,
        },
        description:{
            type:String,
            required:[true,""],
            trim:true,

        },
        requirements:{
            type:String,
            required:[true,""],
        },
        startDate:{
            type:Date,
            required:[true,""],

        },
        duration:{
            type:String,
            required:[true,""],

        },
        type:{
            type:String,
            enum:[],
            required:true,
        },
        coordinator:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        image: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

const GraduateProgram: Model<IGraduateProgram> =
    mongoose.models.GraduateProgram || mongoose.model<IGraduateProgram>('GraduateProgram', GraduateProgramSchema)

export default GraduateProgram
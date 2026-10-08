import mongoose , {Schema , Document, Model} from "mongoose"

export interface ICampusEvent extends Document {
    title:string
    description:string
    date:Date
    location:string
    image?:string
    createdAt:Date
    updatedAt:Date
}

const CampusEventSchema = new Schema<ICampusEvent>(
    {
        title:{
            type: String,
            required: [true, 'عنوان الفعالية مطلوب'],
            trim: true,
        },
        description:{
            type: String,
            required: [true, 'عنوان الفعالية مطلوب'],
            trim: true,

        },
        date:{
            type: Date,
            required: [true, 'عنوان الفعالية مطلوب'],
        },
        location: {
            type: String,
            required: [true, 'الموقع مطلوب'],
            trim: true,
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

const CampusEvent: Model<ICampusEvent> = mongoose.models.CampusEvent || mongoose.model<ICampusEvent>('CampusEvent', CampusEventSchema)

export default CampusEvent
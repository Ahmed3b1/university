import mongoose, { Schema, Document, Model , Types} from 'mongoose'

export interface IGrade{
    student:Types.ObjectId
    grade:number
    comment?:string
    gradedAt:Date
}

export interface ICourse extends Document{
    _id: mongoose.Types.ObjectId
    title: string
    description: string
    code: string
    professor: Types.ObjectId
    students: Types.ObjectId[]
    grades: IGrade[]
    semester: string
    year: number
    credits: number
    type: 'undergraduate' | 'graduate' | 'online'
    requirements?: string
    schedule?: string
    learningOutcomes?: string[]
    format?: string
    materials: { title: string; url: string; type: string }[]
    image?: string
    createdAt: Date
    updatedAt: Date
}

const GradeSchema = new Schema<IGrade>(
    {
        student:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        grade:{
            type:Number,
            required:true,
            min:0,
            max:100,
        },
        comment:{
            type:String,
            trim:true,
        },
        gradedAt:{
            type:Date,
            default:Date.now,
        },
    },
    {_id:false}
)

const CourseSchema = new Schema<ICourse>(
    {
        title:{
            type:String,
            required:[true, ""],
            trim:true,
        },
        description:{
            type:String,
            trim:true,
            default:"",
        },
        code:{
            type:String,
            required:[true, ""],
            unique:true,
            uppercase:true,
            trim:true,


        },
        professor:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:[true, ""],
        },
        students:[
            {
                type:Schema.Types.ObjectId,
                ref:"User"
            },
        ],
        grades:[GradeSchema],
        semester:{
            type:String,
            enum:[],
            required:true,
        },
        year:{
            type:Number,
            required:true,
        },
        credits:{
            type:Number ,

        },
        type:{
            type:String,
            enum:[],
            default:"undergraduate",
            required:true,
        },
        requirements:{
            type:String,
            trim:true,
        },
        schedule:{
            type:String,
            trim:true,

        },
        learningOutcomes:[
            {
                type:String,
                trim:true,
            },
        ],
        format:{
            type:String,
            trim:true,

        },
        materials:[
            {
                title:String,
                url:String,
                type:String,
            },
        ],
        image: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course
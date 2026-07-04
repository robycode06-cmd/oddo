import mongoose from 'mongoose';

const  LeaveRequestSchema= new mongoose.Schema({
    employeeRef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employee",
        required:true
    },
    leaveType:{
        type:String,
        enum:['paid','sick','unpaid'],
        required:true
    },
    startDate:{
        type:String,      //YYYY-MM-DD
        required:true
    },
    endDate:{
        type:String,
        required:true
    },
    allocatedDays:{
        type:Number,
        required:true
    },
    attachmentUrl:{
        type:String,
        default:null    // for sick leave
    },
    status:{
        type:String,
        enum:['Pending','Approved','Rejected'],
        default:'Pending'
    }
},{timestamps:true});

export default mongoose.model('LeaveRequest',LeaveRequestSchema);
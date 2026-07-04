import leaveRequest from "../model/LeaveRequest.js";

// @route POST /api/leave/request
// @desc Create a new leave request
// @access Private

const createLeaveRequest=async (req,res)=>{
       try{
        const {leaveType,startDate,endDate,allocatedDays }=req.body;
        
        const attachmentUrl=req.file?req.file.path:null;  // By mutler I suppose

        const newRequest=new leaveRequest({
            employeeRef:req.user.id,
            leaveType,
            startDate,
            endDate,
            allocatedDays,
            attachmentUrl
        });

        await newRequest.save();

         res.status(201).json({message:'Leave request submitted successfully.',data:newRequest});
       }catch(error){
         res.status(500).json({error:'Failed to submit leave requests.'});
       }
       
}
// @route GET /api/leave/all
// @desc Get all request to the Admin dashboard
// @access Private/Admin

const getAllLeaveRequests=async (req,res)=>{
      try{
         const requests= await leaveRequest.find()
         .populate('employeeRef','profile.firstName profile.lastName loginId')
         .sort({createdAt:-1});
      }catch(error){
        res.status(500).json({ error: 'Failed to fetch leave requests.' });
      }
}

// @route PUT /api/leave/status/:id
// @desc Approve or reject a leave request
// @access Private/Admin

const updateLeaveStatus=async(req,res)=>{
    try{
        const {status}=req.body;

        if(!['Approved','Rejected'].includes(status)){
           return res.status(400).json({error:'Invalid status update.'});
        }

        const updatedRequest=await leaveRequest.findByIdAndUpdate(
            req.params.id,
            {status},
            {new:true}
        );

        if(!updatedRequest) res.status(404).json({error:'Update request not found'});

        res.status(201).json({message:`Leave request ${status.toLowerCase()}.`, data: updatedRequest});
    }catch(error){
        res.status(500).json({error:'Failed to update leave status'});
    }
}

module.exports={createLeaveRequest, getAllLeaveRequests, updateLeaveStatus};

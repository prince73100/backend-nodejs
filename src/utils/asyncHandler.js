const asyncHandler=(reqHandler)=>{
  return   (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next)).catch((err)=>{next(err)})
    }
}




export default asyncHandler
















// try chatch method

// const asyncHandler=(func)=> async(req,res,next)=>{
//     try {
//         await (req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }
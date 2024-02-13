import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOncloudinary = async (localfilepath)=>{
  try {
    if(!localfilepath) return null;
    // upload file on cloudinary
   const respose =  await cloudinary.uploader.upload(localfilepath,{
        resource_type:"auto"
    })
    // file has been uploaded successfully
    console.log("file is uploaded on cloudinary",respose.url);
    return respose;
  } catch (error) {
    fs.unlinkSync(localfilepath) // remove the locally saved temporery file as the upload failed got failed
    return null
  }
}

export default uploadOncloudinary



// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });
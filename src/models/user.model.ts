import mongoose from 'mongoose';
import { IUser } from '@/types/user.types';
import bcrypt from 'bcryptjs';


interface UserDocument extends Omit<IUser , '_id'>,Document{
    comparePassword(candidatePassword : string) : boolean
}


const userSchema = new mongoose.Schema<UserDocument>({
    username : {
        type : String , 
        unique : true , 
        required : [true , 'Name ire required']
    },

    email : {
        type : String , 
        unique : true , 
        required : [true , 'Email ire required']
    },


    password : {
        type : String , 
        required : true , 
        minlength : 5
    },

    mobile : {
        type : String , 
        required : true , 
        maxlength : 10,
        minlength : 10 , 
    },
  
}, {timestamps : true});



userSchema.pre('save' , async function (){
    if(!this.isModified('password')) return ;
    this.password = await bcrypt.hash(this.password , 10);
})


userSchema.methods.comparePassword = function (candidatePassword : string){
    return bcrypt.compareSync(candidatePassword , this.password);
}

const userModel = mongoose.model('User' , userSchema);
export default userModel ; 
const User = require('../model/userDetails')
const Class = require('../model/class.model')
const Post = require('../model/Post.model')

function generateRandomCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

async function generateUniqueClassCode(length = 6) {
    let classCode;
    let isUnique = false;

    while (!isUnique) {
        classCode = generateRandomCode(length);

        const existingClass = await Class.findOne({ classCode });
        if (!existingClass) {
            isUnique = true;
        }
    }

    return classCode;
}

const createClass = async (req, res) => {
    try {
        const user = req.user

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        const { name, description, subject } = req.body

        if (!(name || subject)) {
            return res.status(404).json({
                success: false,
                message: "provide all information properly"
            })
        }

        const classCode = await generateUniqueClassCode()

        const newclass = await Class.create({
            name,
            description,
            subject,
            classCode,
            creator: user._id,
        })

        if (!newclass) {
            return res.status(500).json({
                success: false,
                message: "Class not create"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Class created successfully",
            data: newclass
        })


    } catch (e) {
        console.log("Error in Class Controller:", e)
    }
}

const editclass = async (req, res) => {
    try {
        const user = req.user;
        const { classid } = req.body  // || req.query after complete frontend uncomment this portion
        const userclass = await Class.findById(classid)

        if (!userclass) {
            return res.status(404).json({
                success: false,
                message: "class not found"
            })
        }

        const { _id } = user
        const { creator } = userclass

        if (_id.toString() !== creator.toString()) {
            return res.status(300).json({
                success: false,
                message: "you are not valid author to change anything"
            })
        }

        const { name, description, subject } = req.body

        //update in class model

        userclass.name = name
        userclass.description = description
        userclass.subject = subject
        await userclass.save({ validateBeforeSave: false })

        return res.status(200).json({
            success: true,
            message: "updated successfully"
        })

    } catch (e) {
        console.log("error in editclass controller:", e)
    }
}

const getclass = async (req, res) => {
    try {
        // const classid = req.query || req.body.classid
        // console.log("dsv",classid)
        const { classid } = req.body // while frontend ready please comment this line otherwise write req.query inplace of req.body
        if (!classid) {
            return res.status(404).json({
                success: false, message: "class id not get from req"
            })
        }

        const classdetail = await Class.findById(classid).select('-assignments -updatedAt -__v ')

        if (!classdetail) {
            return res.status(404).json({
                success: false, message: "class not get successfully"
            })
        }

        return res.status(200).json({
            success: true,
            message: "class found successfully",
            classdetail
        })

    } catch (e) {
        console.log("error in getclass detail controller", e)
    }
}

const joinclass = async (req, res) => {
    try {

        const user = req.user

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "user not found"
            })
        }

        const { classCode } = req.body

        if (!classCode) {
            return res.status(404).json({
                success: flase,
                message: "Classcode not found"
            })
        }

        const classRoom = await Class.findOne({ classCode: classCode });

        if (classRoom.students.includes(user._id)) {
            throw new Error("Alredy Joined")
        }

        classRoom.students.push(user._id);
        await classRoom.save();


        // await Class.findOneAndUpdate({classCode:classCode},{$push:{students:user._id}},{ new: true })
        const temUser = await User.findOneAndUpdate({ _id: user._id }, { $push: { joinedclass: classRoom._id } }, { new: true })

        return res.status(200).json({
            success: true,
            message: "class joined successfully",
            classRoom,
            temUser
        })

    } catch (e) {
        console.log(e)
        return res.status(200).json({
            success: false,
            message: e.message,
        })
    }
}

const leaveclass = async (req, res) => {
    try {
        const user = req.user;

        const { classId } = req.body

        const classData = await Class.findOne({ _id: classId })

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "class not found"
            })
        }

        if (classData.creator.toString() === user._id.toString()) {
            // If creator is leaving, delete the class
            await Class.findByIdAndDelete(classId);

            // Remove class reference from all students
            await User.updateMany(
                { joinedclass: classId },
                { $pull: { joinedclass: classId } }
            );

            // Remove related posts
            await Post.deleteMany({ class: classId });
            return res.status(200).json({ message: 'Class and related data deleted successfully' });
        } else {
            // If a student is leaving, remove them from the class
            await Class.findByIdAndUpdate(
                classId,
                { $pull: { students: user._id } }
            );

            // Remove class from student's joined classes
            await User.findByIdAndUpdate(
                user._id,
                { $pull: { joinedclass: classId } }
            );

            return res.status(200).json({ message: 'Left class successfully' });
        }

    } catch (e) {
        console.log("error in leave class controller", e)
    }
}

const getAllClasses = async (req, res) => {
    try {

        if (!req.user._id) {
            return res.status(404).json({
                success: false, message: "User id not Found"
            })
        }

        const ownClasses = await Class.find({ creator: req.user._id }).select(`_id name description subject`);
        const joinedClasses = await Class.find({ students: req.user._id }).select(`_id name description subject`)

        return res.status(200).json({
            success: true,
            message: "class found successfully",
            ownClasses,
            joinedClasses
        })

    } catch (e) {
        console.log("error in getclass detail controller", e)
    }
}


const getmembers = async (req, res) => {
    try {
        const { classroomID } = req.query
        // console.log(classCode)
        // const getclassfromcode = await Class.findOne({_id:classroomID}) ;

        const getclassfromcode = await Class.findOne({ _id: classroomID })
            .populate('facultys', 'firstName lastName _id') // Only include specific fields from User
            .populate('students', 'firstName lastName _id');


        if (!getclassfromcode) {
            return res.status(404).json({
                message: "class not found",
                success: false
            })
        }

        const teachers = getclassfromcode.facultys
        const students = getclassfromcode.students

        return res.status(200).json({
            success: true,
            message: "data got successfully",
            teachers,
            students
        })

    }
    catch (err) {
        console.log("error in get members controller", err)

    }
}


const removemember = async (req, res) => {
    try {
        const { classroomID, userID } = req.query;

        // Ensure both classroomID and userID are provided
        if (!classroomID || !userID) {
            return res.status(400).json({
                success: false,
                message: "classroomID and userID are required"
            });
        }

        // Find the class and remove the userID from the students array
        const updatedClass = await Class.findByIdAndUpdate(
            classroomID,
            { $pull: { students: userID } }, // Remove the userID from students array
            { new: true } // Return the updated document
        );

        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { $pull: { joinedclass: classroomID } }, // Remove the userID from students array
            { new: true } // Return the updated document
        );

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student removed successfully",
            class: updatedClass
        });

    } catch (e) {
        console.log("error in removemember controller", e)
    }
}

const classdetail = async (req, res) => {
    try {
        const { classroomID } = req.query;

        const classRoom = await Class.findById(classroomID).select("name description subject classCode")
        if (!classRoom) {
            return res.status(404).json({
                message: "class not found",
                success: false
            })
        }
        return res.status(200).json({
            message: 'class detail fetch successfully',
            classRoom: classRoom,
            success: true
        })
    }
    catch (e) {
        console.log("error in classdetail controller", e)
    }
}

const updateclassdetail = async (req, res) => {
    try {
        const { classId } = req.query
        const { name, subject, description } = req.body
        const classRoom = await Class.findByIdAndUpdate(classId, { name, subject, description }, { new: true })
        if (!classRoom) {
            return res.status(404).json({
                message: "class not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "class detail updated successfully",
            classRoom: classRoom,
            success: true
        })
    } catch (e) {
        console.log('error in updateclassdetail controller', e)
    }
}

module.exports = { createClass, editclass, getclass, joinclass, leaveclass, getAllClasses, getmembers, removemember, classdetail, updateclassdetail }
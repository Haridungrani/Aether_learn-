import React from 'react'
import s from './Sidebar.module.css'
import { GoHome, GoPeople } from "react-icons/go";
import { SlGraduation } from "react-icons/sl";
import { Link } from 'react-router-dom';


const Sidebar = ({ classes, userRole }) => {
    const isFaculty = userRole === 'faculty' || userRole === 'admin';
    const isStudent = userRole === 'student';

    // Safety check for classes
    const ownClasses = classes?.ownClasses || [];
    const joinedClasses = classes?.joinedClasses || [];

    return (
        <div className={s.SideBarContainer}>
            <div className={s.list1}>
                <GoHome className={s.HoneIcon} />
                <Link to="/dashboard" className={s.navlinkFix}><p>Home</p></Link>
            </div>

            {/* Show Teaching section only for Faculty/Admin */}
            {isFaculty && ownClasses.length > 0 && (
                <>
            <div className={s.seprationTitle}>
                <GoPeople className={s.HoneIcon} />
                Teaching
            </div>
            <div className={s.list2}>
                {
                            ownClasses.map((data, index) => (
                                <Link key={index} to={`/dashboard/own/${data._id}/posts`} className={s.navlinkFix}>
                                    <p className={s.classListView}>{data.name}</p>
                                </Link>
                            ))
                }
            </div>
                </>
            )}

            {/* Show Learning section for all users */}
            {joinedClasses.length > 0 && (
                <>
            <div className={s.seprationTitle}>
                <SlGraduation className={s.HoneIcon} />
                        {isStudent ? 'Enrolled Classes' : 'Learning'}
            </div>
                <div className={s.list2}>
                    {
                            joinedClasses.map((data, index) => (
                                <Link key={index} to={`/dashboard/joined/${data._id}/posts`} className={s.navlinkFix}>
                                    <p className={s.classListView}>{data.name}</p>
                                </Link>
                            ))
                    }
                </div>
                </>
            )}

        </div>
    )
}

export default Sidebar
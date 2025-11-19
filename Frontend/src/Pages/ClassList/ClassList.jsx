import React from 'react';
import s from './ClassList.module.css';
import { Link } from 'react-router-dom'
import ClassroomCard from '../../Components/ClassroomCard/ClassroomCard';
import { useSelector } from 'react-redux';
const ClassList = () => {

    const { classes, loading } = useSelector((state) => state.classes);
    const { user } = useSelector((state) => state.profile);

    const isFaculty = user?.role === 'faculty' || user?.role === 'admin';
    const isStudent = user?.role === 'student';

    // Safety check for classes
    const ownClasses = classes?.ownClasses || [];
    const joinedClasses = classes?.joinedClasses || [];

    return (
        <div className={s.container}>
            {
                loading ? (<h1>Loading</h1>) : (<>
                    {/* Show "Your Classes" section only for Faculty/Admin */}
                    {isFaculty && (
                        <>
                            {
                                ownClasses.length === 0 ? (
                                    <div className={s.emptyState}>
                                        <h2>You don't own any classes</h2>
                                        <p>Create a new class to get started!</p>
                                    </div>
                                ) : (
                                    <>
                            <h1 className={s.h1Title}>Your Classes</h1>
                            {
                                            ownClasses.map((item, index) => (
                                                <Link key={index} to={`/dashboard/own/${item._id}/posts`}>
                                        <ClassroomCard item={item} />
                                    </Link>
                                ))
                            }
                                    </>
                                )
                    }
                        </>
                    )}

                    {/* Show "Joined/Enrolled Classes" section for all users */}
                    {
                        joinedClasses.length === 0 ? (
                            <div className={s.emptyState}>
                                <h2>You haven't joined any classes</h2>
                                <p>{isStudent ? "Join a class using a class code to get started!" : "Join a class to view content!"}</p>
                            </div>
                        ) : (
                            <>
                                <h1 className={s.h1Title}>{isStudent ? 'Enrolled Classes' : 'Joined Classes'}</h1>
                            {
                                    joinedClasses.map((item, index) => (
                                        <Link key={index} to={`/dashboard/joined/${item._id}/posts`}>
                                        <ClassroomCard item={item} />
                                    </Link>
                                ))
                            }
                            </>
                        )
                    }

        
                </>)
            }
        </div>
    )
}

export default ClassList
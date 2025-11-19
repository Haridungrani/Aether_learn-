import React, { useEffect } from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import s from './Dashboard.module.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import { getClasses2 } from '../../services/operation/classroom'
import { useDispatch, useSelector } from 'react-redux'


const Dashboard = () => {

    const dispatch = useDispatch()
    const { classes, loading } = useSelector((state) => state.classes);
    const { user } = useSelector((state) => state.profile);

    useEffect(() => {
        dispatch(getClasses2());
    }, [dispatch])


    return (
        <div className={s.DashboardContainer}>
            {
                loading ? (<>Loading...</>) : (
                    <>
                        <Navbar />
                        <div className={s.ContentContainer}>
                            <Sidebar classes={classes} userRole={user?.role} />
                            <div className={s.pagesBox}>
                                <Outlet />
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default Dashboard
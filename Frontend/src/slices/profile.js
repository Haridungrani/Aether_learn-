import { createSlice } from "@reduxjs/toolkit"
import Cookies from 'js-cookie';

// const initialState = {
//     user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
//     token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
//     loading: false,
// };

// Check if token exists in both localStorage and cookies
// Only set token if it exists in cookies (server sets it)
const getInitialToken = () => {
    const cookieToken = Cookies.get('token');
    const localToken = localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null;

    // If cookie exists, use it (means user is logged in)
    // If no cookie but localStorage exists, clear localStorage (stale data)
    if (cookieToken) {
        return cookieToken;
    } else if (localToken) {
        // Clear stale localStorage data if cookie doesn't exist
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
    }
    return null;
};

const getInitialUser = () => {
    const cookieToken = Cookies.get('token');
    const localUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    // Only use localStorage user if cookie token exists (means session is valid)
    if (cookieToken && localUser) {
        return localUser;
    } else if (localUser) {
        // Clear stale user data if cookie doesn't exist
        localStorage.removeItem("user");
        return null;
    }
    return null;
};

const initialState = {
    user: getInitialUser(),
    token: getInitialToken(),
    loading: false,
};


const profileSlice = createSlice({
    name: "profile",
    initialState: initialState,

    reducers: {
        setUser(state, value) {
            state.user = value.payload;
        },
        setLoading(state, value) {
            state.loading = value.payload;
        },
        setToken(state, value) {
            state.token = value.payload;
        }
    },
});

export const { setUser, setLoading, setToken } = profileSlice.actions;
export default profileSlice.reducer;
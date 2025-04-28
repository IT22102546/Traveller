/* eslint-disable no-unused-vars */
import React from 'react'
import { Link, useNavigate } from "react-router-dom";

const expenses = () => {
    return (
        <div className='bg-green-500 w-full h-full justify-around flex items-center mt-20'>
            <p>expenses</p>
            <Link to="add"  >
                <p className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded '>
                    add</p>
            </Link>
            <Link to="list"  >
                <p className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded '>
                    List</p>
            </Link>

        </div>
    )
}

export default expenses
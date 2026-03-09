import React, { useEffect, useState } from "react";
import { restaurantOnlyLogged } from "../../Api";
import { Search, User } from "lucide-react";

const OnlyLoggedUser = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const res = await restaurantOnlyLogged();
        // Handle the response structure correctly
        if (res?.data?.users) {
            setUsers(res.data.users);
        } else if (res?.users) {
            setUsers(res.users);
        } else if (Array.isArray(res)) {
            setUsers(res);
        } else if (res?.data && Array.isArray(res.data)) {
            setUsers(res.data);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    console.log("Users data:", users);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Only Logged Users
            </h1>

            {/* Table */}
            <div className="bg-white shadow rounded-xl overflow-hidden h-[70vh] overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">User ID</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Logged In At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="p-3 border-t">
                                        <div className="flex items-center gap-3">
                                            <User className="text-gray-500" size={18} />
                                            <span className="text-sm font-mono">{user._id}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 border-t text-gray-700">
                                        {user.email || "N/A"}
                                    </td>
                                    <td className="p-3 border-t text-gray-700">
                                        {user.phone || "N/A"}
                                    </td>
                                    <td className="p-3 border-t">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'RESTAURANT'
                                                ? 'bg-green-100 text-green-800'
                                                : user.role === 'DRIVER'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 border-t text-gray-700">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Optional: Show count */}
            {users.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Total users: {users.length}
                </div>
            )}
            <h1 className="text-md font-bold mb-6 text-gray-400 text-center">
                Hungzo Admin Panel
            </h1>;
        </div>
    );

};

export default OnlyLoggedUser;
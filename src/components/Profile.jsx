import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        homeAddress: user?.homeAddress || '',
        workAddress: user?.workAddress || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                homeAddress: user.homeAddress || '',
                workAddress: user.workAddress || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateUser(formData);
        setEditing(false);
    };

    return (
        <div className="container mx-auto mt-8 p-4">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            {editing ? (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Home Address</label>
                        <textarea
                            name="homeAddress"
                            value={formData.homeAddress}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Work Address</label>
                        <textarea
                            name="workAddress"
                            value={formData.workAddress}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        ></textarea>
                    </div>
                    <button type="submit" className="bg-[#004E89] text-white px-4 py-2 rounded">Save Changes</button>
                </form>
            ) : (
                <div>
                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>Home Address:</strong> {user?.homeAddress}</p>
                    <p><strong>Work Address:</strong> {user?.workAddress}</p>
                    <button
                        onClick={() => setEditing(true)}
                        className="bg-[#004E89] text-white px-4 py-2 rounded mt-4"
                    >
                        Edit Profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
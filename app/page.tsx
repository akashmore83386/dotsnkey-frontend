"use client";

// DataTable.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface IUser {
  _id: string;
  FullName: string;
  Email: string;
  CountryId: { name: string };
  StateId: { name: string };
  CityId: { name: string };
  LanguageIds: { name: string }[];
  isActive: boolean;
  CreatedDate: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex space-x-2">
      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 border ${
            currentPage === page ? "bg-gray-300" : ""
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

const DataTable = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<IUser>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((response) => {
        setUsers(response.data.customers);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const handleEdit = (userId: string) => {
    setEditingId(userId);
    const userToEdit = users.find((user) => user._id === userId);
    setEditedData(userToEdit || {});
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:5000/deleteCustomer/${userId}`);
      // Update local state by removing the deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        await axios.put(
          `http://localhost:5000/updateCustomer/${editingId}`,
          editedData
        );
        // Update local state with the edited data
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingId ? { ...user, ...editedData } : user
          )
        );
        setEditingId(null);
        setEditedData({});
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto mt-8">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Full Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Country</th>
            <th className="py-2 px-4 border-b">State</th>
            <th className="py-2 px-4 border-b">City</th>
            <th className="py-2 px-4 border-b">Languages</th>
            <th className="py-2 px-4 border-b">Active</th>
            <th className="py-2 px-4 border-b">Created Date</th>
            <th className="py-2 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user._id}>
              <td className="py-2 px-4 border-b">{user._id}</td>
              <td className="py-2 px-4 border-b">
                {editingId === user._id ? (
                  <input
                    type="text"
                    value={editedData.FullName || ""}
                    onChange={(e) =>
                      setEditedData({ FullName: e.target.value })
                    }
                  />
                ) : (
                  user.FullName
                )}
              </td>
              <td className="py-2 px-4 border-b">
                {editingId === user._id ? (
                  <input
                    type="text"
                    value={editedData.Email || ""}
                    onChange={(e) => setEditedData({ Email: e.target.value })}
                  />
                ) : (
                  user.Email
                )}
              </td>
              <td className="py-2 px-4 border-b">{user.CountryId.name}</td>
              <td className="py-2 px-4 border-b">{user.StateId.name}</td>
              <td className="py-2 px-4 border-b">{user.CityId.name}</td>
              <td className="py-2 px-4 border-b">
                {user.LanguageIds.map((lang) => lang.name).join(", ")}
              </td>
              <td className="py-2 px-4 border-b">
                {user.isActive ? "Yes" : "No"}
              </td>
              <td className="py-2 px-4 border-b">{user.CreatedDate}</td>
              <td className="py-2 px-4 border-b">
                {editingId === user._id ? (
                  <button
                    className="bg-green-500 text-white py-1 px-2 mr-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white py-1 px-2 mr-2"
                    onClick={() => handleEdit(user._id)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="bg-red-500 text-white py-1 px-2"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

import { z, ZodError } from "zod";

const fetchCountries = () => axios.get("http://localhost:5000/countries");
const fetchStates = (countryId: any) =>
  axios.get(`http://localhost:5000/states/${countryId}`);
const fetchCities = (stateId: any) =>
  axios.get(`http://localhost:5000/cities/${stateId}`);
const fetchLanguages = () => axios.get("http://localhost:5000/languages");

const customerSchema = z.object({
  fullName: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  country: z.object({
    label: z.string(),
    value: z.string(),
  }),
  state: z.object({
    label: z.string(),
    value: z.string(),
  }),
  city: z.object({
    label: z.string(),
    value: z.string(),
  }),
  languages: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

interface Country {
  label: string;
  value: string;
}

interface State {
  label: string;
  value: string;
}

interface City {
  label: string;
  value: string;
}

interface Language {
  label: string;
  value: string;
}

// interface FormData {
//   fullName: string;
//   email: string;
//   password: string;
//   country: Country | null;
//   state: State | null;
//   city: City | null;
//   languages: Language[];
// }

// const initialFormData: FormData = {
//   fullName: "",
//   email: "",
//   password: "",
//   country: null,
//   state: null,
//   city: null,
//   languages: [],
// };

interface FormData {
  FullName: string;
  Email: string;
  Password: string;
  CountryId: string;
  StateId: string;
  CityId: string;
  LanguageIds: string;
}

const CustomerForm = () => {
  const [formData, setFormData] = useState<FormData>({
    FullName: "",
    Email: "",
    Password: "",
    CountryId: "",
    StateId: "",
    CityId: "",
    LanguageIds: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (field: any, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear errors when a field is changed
    setErrors({
      ...errors,
      [field]: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form fields
    const newErrors: Partial<FormData> = {};
    Object.keys(formData).forEach((field) => {
      if (!formData[field as keyof FormData]) {
        newErrors[field as keyof FormData] = `${field} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Make a POST request to your API endpoint
      const response = await axios.post(
        "http://localhost:5000/create",
        formData
      );

      // Handle success or additional logic here
      console.log("User created successfully:", response.data);
    } catch (error) {
      // Handle error
      console.error("Error creating user:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.FullName}
          onChange={(e) => handleChange("FullName", e.target.value)}
        />
        {errors.FullName && <p className="error">{errors.FullName}</p>}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.Email}
          onChange={(e) => handleChange("Email", e.target.value)}
        />
        {errors.Email && <p className="error">{errors.Email}</p>}
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.Password}
          onChange={(e) => handleChange("Password", e.target.value)}
        />
        {errors.Password && <p className="error">{errors.Password}</p>}
      </div>

      <div>
        <label htmlFor="countryId">Country ID:</label>
        <input
          type="text"
          id="countryId"
          name="countryId"
          value={formData.CountryId}
          onChange={(e) => handleChange("CountryId", e.target.value)}
        />
        {errors.CountryId && <p className="error">{errors.CountryId}</p>}
      </div>

      <div>
        <label htmlFor="stateId">State ID:</label>
        <input
          type="text"
          id="stateId"
          name="stateId"
          value={formData.StateId}
          onChange={(e) => handleChange("StateId", e.target.value)}
        />
        {errors.StateId && <p className="error">{errors.StateId}</p>}
      </div>

      <div>
        <label htmlFor="cityId">City ID:</label>
        <input
          type="text"
          id="cityId"
          name="cityId"
          value={formData.CityId}
          onChange={(e) => handleChange("CityId", e.target.value)}
        />
        {errors.CityId && <p className="error">{errors.CityId}</p>}
      </div>

      <div>
        <label htmlFor="languageIds">Language IDs (comma-separated):</label>
        <input
          type="text"
          id="languageIds"
          name="languageIds"
          value={formData.LanguageIds}
          onChange={(e) => handleChange("LanguageIds", e.target.value)}
        />
        {errors.LanguageIds && <p className="error">{errors.LanguageIds}</p>}
      </div>

      <div>
        <button type="submit">Create Customer</button>
      </div>
    </form>
  );
};

export default function Home() {
  return (
    <main>
      <DataTable />
      <CustomerForm />
    </main>
  );
}
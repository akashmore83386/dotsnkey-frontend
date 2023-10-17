"use client";

// CustomerForm.js
import React, { useEffect, useState } from "react";
import { z, ZodError } from "zod";
import axios from "axios";
import Select from "react-select";
import { useModal } from "@/hooks/use-modal-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// Assuming you have API endpoints to fetch countries, states, cities, and languages
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

// Assuming you have types for Country, State, City, and Language
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

interface FormData {
  fullName: string;
  email: string;
  password: string;
  country: Country | null;
  state: State | null;
  city: City | null;
  languages: Language[];
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  password: "",
  country: null,
  state: null,
  city: null,
  languages: [],
};

const CustomerForm = () => {
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    password: string;
    country: { label: string; value: string } | null;
    state: { label: string; value: string } | null;
    city: { label: string; value: string } | null;
    languages: { label: string; value: string }[];
  }>({
    fullName: "",
    email: "",
    password: "",
    country: null,
    state: null,
    city: null,
    languages: [],
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [error, setError] = useState<string | null>(null);
  const { isOpen, onClose, type, onOpen } = useModal();
  const isModalOpen = isOpen && type === "createUser";
  // custom on close modal handler

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const countriesResponse = await fetchCountries();
        setCountries(countriesResponse.data);

        const languagesResponse = await fetchLanguages();
        setLanguages(languagesResponse.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field: any, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Fetch states and cities based on the selected country and state
    if (field === "country" && value) {
      fetchStates(value.value)
        .then((response) => setStates(response.data))
        .catch((error) => console.error("Error fetching states:", error));

      setFormData({ ...formData, state: null, city: null });
      setCities([]);
    } else if (field === "state" && value) {
      fetchCities(value.value)
        .then((response) => setCities(response.data))
        .catch((error) => console.error("Error fetching cities:", error));

      setFormData({ ...formData, city: null });
    }
  };

  const handleLanguageChange = (selectedLanguages: any) => {
    setFormData({
      ...formData,
      languages: selectedLanguages,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      customerSchema.parse(formData); // Validate form data

      // Send data to your API for customer creation
      await axios.post("http://localhost:5000/createCustomer", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        countryId: formData.country,
        stateId: formData.state,
        cityId: formData.city,
        languageIds: formData.languages.map((lang) => lang.value),
      });

      // Clear form and reset error
      setFormData({
        fullName: "",
        email: "",
        password: "",
        country: null,
        state: null,
        city: null,
        languages: [],
      });
      setError(null);

      console.log("Customer created successfully!");
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation error
        setError(error.errors[0].message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="bg-white text-black p-0 overflow-hidden"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Register
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
          <div>
            <label>Country:</label>
            <Select
              options={countries}
              value={formData.country}
              onChange={(selectedOption: any) =>
                handleChange("country", selectedOption)
              }
              isSearchable
            />
          </div>
          <div>
            <label>State:</label>
            <Select
              options={states}
              value={formData.state}
              onChange={(selectedOption: any) =>
                handleChange("state", selectedOption)
              }
              isSearchable
            />
          </div>
          <div>
            <label>City:</label>
            <Select
              options={cities}
              value={formData.city}
              onChange={(selectedOption: any) =>
                handleChange("city", selectedOption)
              }
              isSearchable
            />
          </div>
          <div>
            <label>Languages:</label>
            <Select
              options={languages}
              value={formData.languages}
              onChange={handleLanguageChange}
              isSearchable
              isMulti
            />
          </div>
          <div>
            <button type="submit">Create Customer</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;
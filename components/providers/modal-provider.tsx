"use client";

import { useState, useEffect } from "react";
import CreateUser from "../modals/create-user";
import RemoveUser from "../modals/remove-user";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
    <CreateUser />
    <RemoveUser />
    </>
  );
};
import { useEffect, useMemo, useState } from "react";

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function readLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export default function useSalonScheduling(products) {
  const [agendamentos, setAgendamentos] = useState(() => readLocalStorage("agendamentos"));
  const [historicoAgendamentos, setHistoricoAgendamentos] = useState(() =>
    readLocalStorage("historicoAgendamentos")
  );
  const [currentCategory, setCurrentCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hideBadgeUntilNextAdd, setHideBadgeUntilNextAdd] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastConfirmation, setLastConfirmation] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const filteredProducts = useMemo(() => {
    if (currentCategory === "all") return products;
    return products.filter((product) => product.category === currentCategory);
  }, [currentCategory, products]);

  const cartCount = useMemo(
    () => agendamentos.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [agendamentos]
  );

  const cartTotal = useMemo(
    () => agendamentos.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [agendamentos]
  );

  const confirmedCount = useMemo(
    () =>
      historicoAgendamentos.reduce(
        (total, item) => total + Math.max(1, Number(item.quantity) || 1),
        0
      ),
    [historicoAgendamentos]
  );

  useEffect(() => {
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
  }, [agendamentos]);

  useEffect(() => {
    localStorage.setItem("historicoAgendamentos", JSON.stringify(historicoAgendamentos));
  }, [historicoAgendamentos]);

  const showToast = (message, type = "success") => {
    const id = makeLocalId();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 900);
  };

  const addToCart = (productId) => {
    setHideBadgeUntilNextAdd(false);
    const product = products.find((item) => item.id === productId);
    if (!product) {
      showToast("Serviço não encontrado", "error");
      return;
    }

    setAgendamentos((prev) => [
      ...prev,
      {
        __backendId: makeLocalId(),
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        appointment_date: getToday(),
        appointment_time: "",
        added_at: new Date().toISOString(),
      },
    ]);
    showToast(`${product.name} agendado!`, "success");

  };

  const updateQuantity = (itemId, delta) => {
    const target = agendamentos.find((item) => item.__backendId === itemId);
    if (!target) return;

    const nextQuantity = target.quantity + delta;
    if (nextQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setAgendamentos((prev) =>
      prev.map((item) => {
        if (item.__backendId !== itemId) return item;
        return { ...item, quantity: nextQuantity };
      })
    );
  };

  const removeFromCart = (itemId) => {
    setAgendamentos((prev) => prev.filter((item) => item.__backendId !== itemId));
    showToast("Item removido", "success");
  };

  const updateAppointment = (itemId, field, value) => {
    setAgendamentos((prev) =>
      prev.map((item) =>
        item.__backendId === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const requestCancelAppointment = (itemId) => {
    setAppointmentToCancel(itemId);
  };

  const closeCancelAppointment = () => {
    setAppointmentToCancel(null);
  };

  const cancelAppointment = () => {
    if (!appointmentToCancel) return;
    setHistoricoAgendamentos((prev) =>
      prev.filter((item) => item.__backendId !== appointmentToCancel)
    );
    closeCancelAppointment();
    showToast("Agendamento cancelado", "success");
  };

  const finalizeScheduling = () => {
    const missingSchedule = agendamentos.some(
      (item) => !item.appointment_date || !item.appointment_time
    );

    if (missingSchedule) {
      showToast("Escolha a data e o horário de cada serviço", "error");
      return;
    }

    const now = new Date();
    const today = getToday();
    const hasPastTime = agendamentos.some((item) => {
      if (item.appointment_date !== today) return false;
      const [hours, minutes] = item.appointment_time.split(":").map(Number);
      return hours * 60 + minutes <= now.getHours() * 60 + now.getMinutes();
    });

    if (hasPastTime) {
      showToast("Escolha um horário futuro para hoje", "error");
      return;
    }

    const novosAgendamentos = agendamentos.flatMap((item) =>
      Array.from({ length: Number(item.quantity) || 1 }, () => ({
        ...item,
        __backendId: makeLocalId(),
        quantity: 1,
        status: "confirmado",
      }))
    );

    setHistoricoAgendamentos((prev) => [...novosAgendamentos, ...prev]);
    setLastConfirmation({
      appointments: novosAgendamentos,
      total: agendamentos.reduce((sum, item) => sum + item.price, 0),
    });
    setAgendamentos([]);
    setHideBadgeUntilNextAdd(true);
    showToast("Agendamento finalizado com sucesso!", "success");
    setIsCartOpen(false);
  };

  return {
    agendamentos,
    addToCart,
    appointmentToCancel,
    cancelAppointment,
    closeCancelAppointment,
    cartCount,
    cartTotal,
    confirmedCount,
    currentCategory,
    filteredProducts,
    finalizeScheduling,
    historicoAgendamentos,
    hideBadgeUntilNextAdd,
    lastConfirmation,
    isCartOpen,
    isHistoryOpen,
    removeFromCart,
    setCurrentCategory,
    setIsCartOpen,
    setIsHistoryOpen,
    setLastConfirmation,
    setAppointmentToCancel,
    requestCancelAppointment,
    toasts,
    updateAppointment,
    updateQuantity,
  };
}

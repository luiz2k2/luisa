import HomeHero from "../components/HomeHero";
import CategoryTabs from "../components/CategoryTabs";
import ServicesGrid from "../components/ServicesGrid";
import CartSidebar from "../components/CartSidebar";
import ToastStack from "../components/ToastStack";
import "../styles/Home.css";
import useSalonScheduling from "../hooks/useSalonScheduling";
import { categories, categoryNames, products } from "../data/salonData";

export default function Home({ setPage }) {
  const {
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
    isCartOpen,
    isHistoryOpen,
    lastConfirmation,
    removeFromCart,
    setCurrentCategory,
    setLastConfirmation,
    setIsCartOpen,
    setIsHistoryOpen,
    toasts,
    updateAppointment,
    updateQuantity,
    requestCancelAppointment,
  } = useSalonScheduling(products);

  return (
    <div className="salon-app">
      <HomeHero
        cartCount={cartCount}
        hideBadgeUntilNextAdd={hideBadgeUntilNextAdd}
        isHistoryOpen={isHistoryOpen}
        onGoContact={() => setPage("contact")}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CategoryTabs
        categories={categories}
        currentCategory={currentCategory}
        onChangeCategory={setCurrentCategory}
      />

      <ServicesGrid
        key={currentCategory}
        filteredProducts={filteredProducts}
        categoryNames={categoryNames}
        formatBRL={(value) => `R$ ${value.toFixed(2).replace(".", ",")}`}
        onAddToCart={addToCart}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        agendamentos={agendamentos}
        historicoAgendamentos={historicoAgendamentos}
        formatBRL={(value) => `R$ ${value.toFixed(2).replace(".", ",")}`}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onCancelAppointment={requestCancelAppointment}
        appointmentToCancel={appointmentToCancel}
        onConfirmCancel={cancelAppointment}
        onCloseCancel={closeCancelAppointment}
        onUpdateAppointment={updateAppointment}
        cartTotal={cartTotal}
        confirmedCount={confirmedCount}
        onFinalizeScheduling={finalizeScheduling}
        lastConfirmation={lastConfirmation}
        onCloseConfirmation={() => setLastConfirmation(null)}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

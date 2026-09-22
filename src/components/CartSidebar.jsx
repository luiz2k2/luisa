import { useEffect, useState } from "react";

function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function durationToMinutes(duration) {
  const hours = Number(duration?.match(/(\d+)\s*h/)?.[1] || 0);
  const minutes = Number(duration?.match(/(\d+)\s*min/)?.[1] || 0);
  return Math.max(30, hours * 60 + minutes);
}

function getAvailableTimesByDuration(items, currentItem, products) {
  const openingMinutes = 9 * 60;
  const closingMinutes = 18 * 60;
  const getItemDuration = (item) =>
    durationToMinutes(
      item.product_duration ||
        products.find((product) => product.id === item.product_id)?.duration
    );

  const currentDuration = getItemDuration(currentItem);
  const sameDayItems = items.filter(
    (item) =>
      item.__backendId !== currentItem.__backendId &&
      item.appointment_date === currentItem.appointment_date &&
      item.appointment_time
  );
  const now = new Date();
  const today = getToday();

  return Array.from(
    { length: (closingMinutes - openingMinutes) / 30 + 1 },
    (_, index) => openingMinutes + index * 30
  )
    .filter((start) => {
      const end = start + currentDuration;
      const isPast =
        currentItem.appointment_date === today &&
        start <= now.getHours() * 60 + now.getMinutes();

        if (start === timeToMinutes(currentItem.appointment_time)) return true;
        if (isPast || end > closingMinutes) return false;

      return sameDayItems.every((item) => {
        const [hours, minutes] = item.appointment_time.split(":").map(Number);
        const itemStart = hours * 60 + minutes;
        const itemEnd = itemStart + getItemDuration(item);
        return end <= itemStart || start >= itemEnd;
      });
    })
    .map((minutes) => {
      const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
      return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
    });
}

export default function CartSidebar({
  isOpen,
  onClose,
  agendamentos,
  historicoAgendamentos,
  products,
  confirmedCount,
  formatBRL,
  onRemoveFromCart,
  onCancelAppointment,
  appointmentToCancel,
  onConfirmCancel,
  onCloseCancel,
  onUpdateAppointment,
  cartTotal,
  onFinalizeScheduling,
  lastConfirmation,
  onOpenWhatsApp,
  onCloseConfirmation,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setCustomerName("");
      setCustomerPhone("");
    }
  }, [isOpen]);

  return (
    <>
      <div className={isOpen ? "cart-overlay show" : "cart-overlay"} onClick={onClose} />

      <aside className={isOpen ? "cart-sidebar open" : "cart-sidebar"}>
        <div className="cart-header">
          <h3>Meus Agendamentos</h3>
          <button aria-label="Fechar painel" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="cart-items">
          {agendamentos.length === 0 && historicoAgendamentos.length === 0 && (
            <p className="empty-cart">Seus agendamentos estão vazios</p>
          )}

          {agendamentos.map((item) => {
            const scheduledItems = [...agendamentos, ...historicoAgendamentos];
            const productImage = item.product_image || products.find((product) => product.id === item.product_id)?.image;
            const availableTimes = getAvailableTimesByDuration(scheduledItems, item, products);

            return (
            <div className="cart-item" key={item.__backendId}>
              <div className="cart-thumb">
                <img src={productImage} alt={`Foto do serviço ${item.product_name}`} />
              </div>
              <div className="cart-info">
                <h4>{item.product_name}</h4>
                <p>{formatBRL(item.price)} cada</p>
                <div className="appointment-fields">
                  <label>
                    Data
                    <input
                      type="date"
                      min={getToday()}
                      value={item.appointment_date || ""}
                      onChange={(event) => {
                        onUpdateAppointment(item.__backendId, "appointment_date", event.target.value);
                        onUpdateAppointment(item.__backendId, "appointment_time", "");
                      }}
                    />
                  </label>
                  <label>
                    Horário
                    <select
                      value={item.appointment_time || ""}
                      onChange={(event) =>
                        onUpdateAppointment(item.__backendId, "appointment_time", event.target.value)
                      }
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="cart-actions">
                <strong>{formatBRL(item.price)}</strong>
                <button className="remove-btn" onClick={() => onRemoveFromCart(item.__backendId)} type="button">
                  Cancelar
                </button>
              </div>
            </div>
            );
          })}

          {historicoAgendamentos.length > 0 && (
            <section className="confirmed-appointments">
              <div className="confirmed-heading">
                <span>Meus Agendamentos</span>
                <small>{confirmedCount} confirmado(s)</small>
              </div>
              {historicoAgendamentos.map((item) => (
                <div className="confirmed-appointment" key={`confirmed-${item.__backendId}`}>
                  <strong>{item.product_name}</strong>
                  <span>
                    {new Date(`${item.appointment_date}T12:00:00`).toLocaleDateString("pt-BR")} às {item.appointment_time}
                  </span>
                  <small>Confirmacao recebida pelo WhatsApp.</small>
                    <button
                    className="cancel-appointment-btn"
                    onClick={() => onCancelAppointment(item.__backendId)}
                    type="button"
                  >
                    Cancelar agendamento
                  </button>
                </div>
              ))}
            </section>
          )}
        </div>

        {agendamentos.length > 0 && (
          <div className="cart-footer">
            <div className="customer-fields">
              <label>
                Seu nome
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Digite seu nome"
                  type="text"
                />
              </label>
              <label>
                WhatsApp
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  type="tel"
                />
              </label>
            </div>
            <div className="cart-total">
              <span>Total:</span>
              <strong>{formatBRL(cartTotal)}</strong>
            </div>
            <button className="checkout-btn" onClick={() => onFinalizeScheduling({ name: customerName, phone: customerPhone })} type="button">
              Finalizar Agendamento
            </button>
          </div>
        )}
      </aside>

      {lastConfirmation && (
        <div className="confirmation-overlay" role="presentation">
          <section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <div className="confirmation-icon">✓</div>
            <p className="confirmation-kicker">Tudo certo</p>
            <h2 id="confirmation-title">Agendamento confirmado</h2>
            <p className="confirmation-copy">
              {lastConfirmation.appointments.length === 1
                ? "Seu horário foi reservado com sucesso. Recebemos sua confirmação pelo WhatsApp."
                : `${lastConfirmation.appointments.length} horários foram reservados com sucesso. Recebemos sua confirmação pelo WhatsApp.`}
            </p>
            <div className="confirmation-list">
              {lastConfirmation.appointments.map((item) => (
                <div className="confirmation-item" key={item.__backendId}>
                  <strong>{item.product_name}</strong>
                  <span>
                    {new Date(`${item.appointment_date}T12:00:00`).toLocaleDateString("pt-BR")} às {item.appointment_time}
                  </span>
                </div>
              ))}
            </div>
            <div className="confirmation-actions">
              <button className="confirmation-whatsapp" onClick={onOpenWhatsApp} type="button">
                Enviar pelo WhatsApp
              </button>
              <button className="confirmation-close" onClick={onCloseConfirmation} type="button">
                Entendi
              </button>
            </div>
          </section>
        </div>
      )}

      {appointmentToCancel && (
        <div className="confirmation-overlay" role="presentation">
          <section className="confirmation-modal cancel-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <h2 id="cancel-title">Cancelar agendamento?</h2>
            <p className="confirmation-copy">Tem certeza que deseja cancelar?</p>
            <div className="cancel-actions">
              <button
                className="cancel-back-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseCancel();
                }}
                type="button"
              >
                Voltar
              </button>
              <button className="cancel-confirm-btn" onClick={onConfirmCancel} type="button">
                Tenho certeza
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

  function timeToMinutes(time) {
    if (!time) return -1;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

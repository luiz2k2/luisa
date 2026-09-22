function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function getAvailableTimes(items, currentItem) {
  const occupiedTimes = items
    .filter(
      (item) =>
        item.__backendId !== currentItem.__backendId &&
        item.appointment_date === currentItem.appointment_date &&
        item.appointment_time
    )
    .map((item) => item.appointment_time);

  const times = Array.from({ length: 16 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const now = new Date();
  const today = getToday();

  return times.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const isPast =
      currentItem.appointment_date === today &&
      hours * 60 + minutes <= now.getHours() * 60 + now.getMinutes();

    return (
      time === currentItem.appointment_time ||
      (!isPast && !occupiedTimes.includes(time))
    );
  });
}

export default function CartSidebar({
  isOpen,
  onClose,
  agendamentos,
  historicoAgendamentos,
  confirmedCount,
  formatBRL,
  onUpdateQuantity,
  onRemoveFromCart,
  onCancelAppointment,
  appointmentToCancel,
  onConfirmCancel,
  onCloseCancel,
  onUpdateAppointment,
  cartTotal,
  onFinalizeScheduling,
  lastConfirmation,
  onCloseConfirmation,
}) {
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

            return (
            <div className="cart-item" key={item.__backendId}>
              <div className="cart-thumb">✦</div>
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
                      onChange={(event) =>
                        onUpdateAppointment(item.__backendId, "appointment_date", event.target.value)
                      }
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
                      <option value=""></option>
                      {getAvailableTimes(scheduledItems, item).map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => onUpdateQuantity(item.__backendId, -1)} type="button">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.__backendId, 1)} type="button">
                    +
                  </button>
                </div>
              </div>
              <div className="cart-actions">
                <strong>{formatBRL(item.price * item.quantity)}</strong>
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
                  <small>Confirmado</small>
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
            <div className="cart-total">
              <span>Total:</span>
              <strong>{formatBRL(cartTotal)}</strong>
            </div>
            <button className="checkout-btn" onClick={onFinalizeScheduling} type="button">
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
                ? "Seu horário foi reservado com sucesso."
                : `${lastConfirmation.appointments.length} horários foram reservados com sucesso.`}
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
            <button className="confirmation-close" onClick={onCloseConfirmation} type="button">
              Entendi
            </button>
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

document.addEventListener('DOMContentLoaded', function() {
  
    var step = 1;
    var min_qty =1;
    var commonSet = {{settings.pr_common_decimal}};
  
    if(commonSet){
      step = parseFloat({{ settings.pr_decimal_step_size }});
      min_qty = parseFloat({{ settings.pr_minimum_qty }});
    }
  
 document.querySelectorAll('.decimal_qty_cart span').forEach((span) => {
        span.addEventListener("click", async () => {
            const key = span.parentElement.getAttribute('data-key');
            const input = span.parentElement.querySelector('input');
            const currentQuantity = parseFloat(input.value);
            const isUp = span.classList.contains('add_cart');

            if (isUp) {
              var newQuantity = currentQuantity + step;
              input.value = newQuantity;
              location.reload();
              await updateLineItemProperty(key, 'Yardage', newQuantity);
            } else if ( currentQuantity > min_qty ){
              const newQuantity = currentQuantity - step;
              input.value = newQuantity;
              location.reload();
              await updateLineItemProperty(key, 'Yardage', newQuantity);
            }
        });
    });

    document.querySelectorAll('.decimal_qty_cart input').forEach((input) => {
        input.addEventListener('keyup', async (event) => {
            const key = input.parentElement.getAttribute('data-key');
            let newQuantity = parseFloat(input.value);
            if (newQuantity < min_qty) {
                newQuantity = min_qty;
            }
            location.reload();
            await updateLineItemProperty(key, 'Yardage', newQuantity);
        });
    });
    
    async function updateLineItemProperty(key, property, newQuantity) {
      const normalQty = Number(newQuantity/step);
      console.log({normalQty});
      
      let noteText, currentPrice;
      $('.line-item-property__label').each(function(){
        let ths = $(this);
        let lineItemText = ths.text();
        if(lineItemText == 'Note:'){
          noteText = $(this).next().text();
        } else if(lineItemText == 'Unit Price:'){
          currentPrice = ths.next().text();
        }
      });
   
    const properties = {
      "Unit Price": currentPrice,
      "Yardage": newQuantity,
      "Note": noteText
    };
    $.ajax({
      url: `/cart/change.js`,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        'id': key,
        'properties': properties,
        'quantity': normalQty
      }),
      dataType: 'json',
      success: function(response) {
        console.log(response);
        const totalPrice = response.total_price;
        const item = response.items.find((item) => item.key === key);
        const itemPrice = item.final_line_price;
        document.querySelector('.amount.theme-money').textContent = "$" + (totalPrice / 100).toFixed(2) + " USD";
        const itemPriceEl = document.querySelector(`.decimal_qty_cart[data-key="${key}"]`).parentElement.parentElement.parentElement.querySelector('.line-total .theme-money');
        itemPriceEl.textContent = "$" + (itemPrice / 100).toFixed(2);
      },
      error: function(error) {
        console.log('Wait for input to reload');
      },
    });
  }
});
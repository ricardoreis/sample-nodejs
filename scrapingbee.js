// request Axios
import axios from 'axios';

axios.get('https://app.scrapingbee.com/api/v1', {
    params: {
        'api_key': 'IUFYTHX8MCSHR2WY78P8AUCZAMUHZ4DUK8GRG3BWMYASVPSJ004E1ERBIIITZIWD5W80CHR0YAZ7BT18',
        'url': 'https://www.techtudo.com.br/google/amp/guia/2023/06/melhor-celular-custo-beneficio-para-comprar-em-2023-veja-modelos-edmobile.ghtml',
    }
}).then(response => {
    // handle success
    console.log(response);
});

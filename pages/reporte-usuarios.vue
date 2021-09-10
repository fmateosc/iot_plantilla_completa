<template>
<div>  
    <base-button @click="generatePdf()">Generar pdf</base-button>

</div>  
</template>
<script>
import jsPDF from "jspdf";
import "jspdf-autotable";

import * as moment from "moment";
moment.locale("es");

export default {
  middleware: "authenticated",
  components: {},
  data() {
    return {
      tableData: [],
    };
  },
  methods: {
    //Obtenemos todos los usuarios
    async getUsers() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      try {
        const res = await this.$axios.get("/users", axiosHeaders);

        this.tableData = res.data.data;
        console.log(this.tableData)
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error obteniendo los usuarios..."
        });
        console.log(error);
        return;
      }
    },
    //Generar PDF
    generatePdf() {
      var columns = [
        {title: "Nombre", dataKey: "name"}, 
        {title: "Email", dataKey: "email"},
        {title: "Creado el", dataKey: "created_at"},
        {title: "Activo", dataKey: "active"}
      ];

      var rows = this.tableData;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter"
      });

      doc.setFontSize(16).text("LISTADO DE USUARIOS", 0.5, 1.0);
      
      doc.setLineWidth(0.01).line(0.5, 1.1, 8.0, 1.1);      

      doc.autoTable({
        columns,
        body: rows,
        margin: { left: 0.5, top: 0.5 },
        startY: doc.pageCount > 1? doc.autoTableEndPosY() + 0.50 : 1.25,
        didParseCell: function(data) {
          if (data.column.dataKey === 'created_at') {
              data.cell.text = moment(data.cell.raw).format("DD/MM/YYYY");
          }
        }
      });

      doc.save("usuarios.pdf");
    }
  },
  mounted() {
    this.getUsers();
  }
};
</script>

<style>
.table-transparent {
  background-color: transparent !important;
}
</style>

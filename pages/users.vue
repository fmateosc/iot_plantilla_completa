<template>
  <div class="div">
    <!----------ESTADÍSTICAS-------------------------------------------------->
    <div class="row">
      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsers"
          sub-title="Usuarios totales"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer">Usuarios totales: {{ totalUsers }}</div>
        </stats-card>
      </div>

      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsersActives"
          sub-title="Usuarios activos"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer">Usuarios activos: {{ totalUsersActives }}</div>
        </stats-card>
      </div>

      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsersInactives"
          sub-title="Usuarios inactivos"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer"><div slot="footer">Usuarios inactivos: {{ totalUsersInactives }}</div></div>
        </stats-card>
      </div>
    </div>

    <!----------FORMULARIO AÑADIR/EDITAR USUARIO ------------------------------>
    <card>
      <div v-if="newUser" slot="header">
        <h4 class="card-title">
          <span>
            <i class="fas fa-user-plus"></i>
          </span>

          Nuevo usuario
        </h4>
      </div>

      <div v-else slot="header">
        <h4 class="card-title">
          <span>
            <i class="fas fa-user-edit"></i>
          </span>

          Editar usuario
        </h4>
      </div>

      <div class="row">
        <div class="col-4">
          <base-input
            label="Nombre"
            type="text"
            placeholder="Nombre de usuario"
            v-model="user.name"
          >
          </base-input>
        </div>

        <div class="col-4">
          <base-input
            label="Email"
            type="email"
            placeholder="Email"
            v-model="user.email"
          >
          </base-input>
        </div>

        <div class="col-4">
          <base-input
            label="Contraseña"
            type="text"
            placeholder="Contraseña"
            v-model="user.password"
            disabled
          >
          </base-input>
        </div>
      </div>

      <div class="row pull-right">
        <div class="col-12">
          <base-button 
            type="primary" 
            class="mb-3" 
            @click="newOrUpdateUser()"
            size="lg"
            >Guardar</base-button
          >
        </div>
      </div>
    </card>

    <!----------TABLA USUARIOS------------------------------------------------->
    <div class="row">
      <div class="col-12">
        <card card-body-classes="table-full-width">
          <p class="table-title" slot="header">Usuarios
            <span>
              <base-button
                type="primary" 
                class="pull-right" 
                @click="generatePdf()">
                Generar pdf
              </base-button>
            </span>
          </p>

          <div>
            <div
              class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
            >
              <el-select
                class="select-primary mb-3 pagination-select"
                v-model="pagination.perPage"
                placeholder="Per page"
              >
                <el-option
                  class="select-primary"
                  v-for="item in pagination.perPageOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>

              <base-input>
                <el-input
                  type="search"
                  class="mb-3 search-input"
                  clearable
                  prefix-icon="el-icon-search"
                  placeholder="Search records"
                  v-model="searchQuery"
                  aria-controls="datatables"
                >
                </el-input>
              </base-input>
            </div>
            <el-table 
              :data="queriedData">

              <!--------------------------NOMBRE------------------------------------->
              <el-table-column
                prop="name"
                label="Nombre"
                width="400">
              </el-table-column>

              <!--------------------------EMAIL------------------------------------->
              <el-table-column
                prop="email"
                label="Email"
                width="400">
              </el-table-column>

              <!--------------------------CREADO EL------------------------------------->
              <el-table-column label="CREADO EL" width="180">
                <template slot-scope="scope">
                  {{ formatDate(scope) }}
                </template>
              </el-table-column>

              <!--------------------------ACTIVO------------------------------------->
              <el-table-column
                prop="active"
                label="Activo"
                width="200">
              </el-table-column>

              <!---------------------------ACCIONES------------------------------------>
              <el-table-column :min-width="135" align="right" label="Actions">
                <div slot-scope="props">
                  <base-button
                    @click.native="showProfile(props.$index, props.row)"
                    class="edit btn-link"
                    type="primary"
                    size="sm"
                    icon
                  >
                    <i class="fa fa-user-md"></i>
                  </base-button>  

                  <base-button
                    @click.native="handleEdit(props.$index, props.row)"
                    class="edit btn-link"
                    type="warning"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-pencil"></i>
                  </base-button>               

                  <base-button
                    @click.native="handleActivarDesactivar(props.$index, props.row)"
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                  >
                     <span v-html= formatIcon(props.row) ></span>
                  </base-button>
                </div>
              </el-table-column>
            </el-table>
          </div>
          <div
            slot="footer"
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category">
                Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
              </p>
            </div>
            <base-pagination
              class="pagination-no-border"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
            >
            </base-pagination>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCard from "@/components/Cards/StatsCard";

import * as moment from "moment";
moment.locale("es");

import jsPDF from "jspdf";
import "jspdf-autotable";

import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";

import Fuse from "fuse.js";

export default {
  middleware: "authenticated",
  name: "paginated",
  components: {
    BasePagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn
  },
  computed: {
    /***
     * Returns a page from the searched data or the whole data. Search is performed in the watch section below
     */
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    }
  },
  data() {
    return {
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      searchQuery: "",
      propsToSearch: [,"name", "email", "active"], 
      searchedData: [],
      fuseSearch: null,      
      tableData: [],
      totalUsers: "0",
      totalUsersActives: "0",
      totalUsersInactives: "0",
      user: {
        id: "",
        name: "",
        email: "",
        password: "",
        active: true
      },
      newUser: true
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

        if (res.data.status == "success") { 
          this.tableData = res.data.data;
          
          this.totalUsers = res.data.totalUsers.toString();
          this.totalUsersActives = res.data.totalUsersActives.toString();
          this.totalUsersInactives = res.data.totalUsersInactives.toString();

          // Fuse search initialization.
          this.fuseSearch = new Fuse(this.tableData, {
            keys: ["name", "email", "active"],
            threshold: 0.3
          });

          this.generatePasswordRand()
        }
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
    //¿Creamos o modificamos el usuario
    newOrUpdateUser() {
      if (this.newUser) {
        this.saveUser();    
      }else{
        this.updateUser()
      }
    },
    //Nuevo usuario
    async saveUser() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      this.$axios
        .post("/register", this.user, axiosHeaders)
        .then(res => {
          //success! - Usuario creado.
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "¡Usuario creado con éxito!"
            });

            this.user.name = "";
            this.user.password = "";
            this.user.email = "";

            this.dialog = false;

            this.getUsers();

            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "¡Usuario existente!"
            });

            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "¡Error al crear el usuario!"
            });

            return;
          }
        });
    },
    //Actualizar usuario
    async updateUser() { 
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      this.$axios
        .put("/update", this.user, axiosHeaders)
        .then(res => {
          //success! - Usuario modificado.
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "¡Usuario actualizado!"
            });

            this.user.name = "";
            this.user.email = "";

            this.newUser = true;

            this.getUsers();

            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "¡Email ya registrado!"
            });

            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error actualizando usuario!"
            });

            return;
          }
        });  
    },  
    //Activar-deactivar usuario
    async activateDesactivate(respuesta) {
      const toSend = {
        userId: this.user.id,
        userActive: respuesta
      };
      
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
     
      this.$axios
        .put("/activateDesactivate", toSend, axiosHeaders)
        .then(res => {
          var mensaje = "";
          
          if (res.data.status == "success") {
            if (respuesta == "ACTIVO") {
              mensaje = "¡Usuario activado!";
            } else {
              mensaje = "¡Usuario desactivado!";
            }
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: mensaje
            });

            this.getUsers();

            return;
          }
        })
        .catch(e => {
          console.log(e.response.data);
        });
    },  
    //Formatea la fecha al español
    formatDate(scope) {
      return moment(scope.row.created_at).format("DD/MM/YYYY");
    },
    formatActiveDesactive(scope) {
      if (scope.row.active == 'ACTIVO') {
        return `<span v-if="scope.row.connected">
                  <i class="fa fa-circle p-r-5 verde" aria-hidden="true"></i>
                  ACTIVO
                </span>`
      } else {
        return `<span v-if="scope.row.connected">
                  <i class="fa fa-circle p-r-5 rojo" aria-hidden="true"></i>
                  INACTIVO
                </span>`
      }
    },
    formatIcon(row) {
      if (row.active == 'ACTIVO') {
        return `<i class="fas fa-lock p-r-5 azul" aria-hidden="true"></i>`
      } else {
        return `<i class="fas fa-unlock p-r-5 rojo" aria-hidden="true"></i>`
      }
    },
    //Generamos un password aleatorio
    generatePasswordRand() {
      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&";
      var pass = "";

      for (var i = 0; i < 15; i++) {
        pass += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      this.user.password = pass;
    },
    handleEdit(index, row) {
      this.newUser = false;

      this.user.id = row._id;
      this.user.name = row.name;
      this.user.email = row.email;
      this.password = '';      
    },
    handleActivarDesactivar(index, row) {
      var respuesta = "";

      this.user.id = row._id;

      if (row.active == "ACTIVO") {
        respuesta = "INACTIVO"
      } else {
        respuesta = "ACTIVO"
      }
      
      this.activateDesactivate(respuesta);
    },
    showProfile(index, row) {      
      this.$store.commit('setProfileId', row._id);     
      
      $nuxt.$router.push("/profile");
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
  },
  watch: {
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.tableData;

      if (value !== "") {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
    }
  }
};
</script>
<style>
.pagination-select,
.search-input {
  width: 200px;
}

.card-title {
  padding-top: 20px !important;
}

.p-r-5 {
  padding-right: 5px;
}

.azul {
  color:#03A9F4 !important;
}

.verde {
  color: green;
}

.rojo {
  color: red;
}

span {
  padding-right: 10px !important;
}

.table-title {
  font-size: 1.0625rem !important;
}
</style>

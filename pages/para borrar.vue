<template>
  <div>
    <!----------ESTADÍSTICAS-------------------------------------------------->
    <div class="row">
      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsers"
          sub-title="Usuarios totales"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer">Mostrar todos los usuarios</div>
        </stats-card>
      </div>

      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsersActives"
          sub-title="Usuarios activos"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer">Mostrar todos los usuarios activos</div>
        </stats-card>
      </div>

      <div class="col-lg-4 col-md-6">
        <stats-card
          :title="totalUsersInactives"
          sub-title="Usuarios inactivos"
          type="primary"
          icon="fas fa-users"
        >
          <div slot="footer">Mostrar todos los usuarios inactivos</div>
        </stats-card>
      </div>
    </div>

    <!-- FORMULARIO AÑADIR/EDITAR USUARIO -->
    <div class="row">
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
            <base-button type="primary" class="mb-3" size="lg"
              >Guardar</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- TABLA USUARIOS -->
    <div class="row">
        <card card-body-classes="table-full-width">
          <h4 slot="header" class="card-title">Paginated Tables</h4>
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
            <el-table :data="queriedData">
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
              >
              </el-table-column>
              <el-table-column :min-width="135" align="right" label="Actions">
                <div slot-scope="props">
                  <base-button
                    @click.native="handleLike(props.$index, props.row)"
                    class="like btn-link"
                    type="info"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-heart-2"></i>
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
                    @click.native="handleDelete(props.$index, props.row)"
                    class="remove btn-link"
                    type="danger"
                    size="sm"
                    icon
                  >
                    <i class="tim-icons icon-simple-remove"></i>
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
</template>

<script>
import * as moment from "moment";
moment.locale("es");

import StatsCard from "@/components/Cards/StatsCard";

import { Table, TableColumn, Select, Option } from "element-ui";
import { BasePagination } from "@/components";
import users from "../util/mock-users";
import Fuse from "fuse.js";
import swal from "sweetalert2";

export default {
  data() {
    return {
      components: {
        StatsCard,
        BasePagination,
        [Select.name]: Select,
        [Option.name]: Option,
        [Table.name]: Table,
        [TableColumn.name]: TableColumn
      },
      users: [],
      user: {
        id: "",
        name: "",
        email: "",
        password: ""
      },
      totalUsers: "",
      totalUsersActives: "",
      totalUsersInactives: "",
      newUser: true,
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      searchQuery: "",
      propsToSearch: ["name", "email", "age"],
      tableColumns: [
        {
          prop: "name",
          label: "Name",
          minWidth: 200
        },
        {
          prop: "email",
          label: "Email",
          minWidth: 250
        },
        {
          prop: "age",
          label: "Age",
          minWidth: 100
        },
        {
          prop: "salary",
          label: "Salary",
          minWidth: 120
        }
      ],
      tableData: users,
      searchedData: [],
      fuseSearch: null
    };
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
  mounted() {
    this.getUsers();

    this.generatePasswordRand();

    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.tableData, {
      keys: ["name", "email"],
      threshold: 0.3
    });
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
  },
  methods: {
    //Obtener todos los usuarios
    async getUsers() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      try {
        const res = await this.$axios.get("/users", axiosHeaders);

        if (res.data.status == "success") {
          this.users = res.data.data;

          this.totalUsers = res.data.totalUsers.toString();
          this.totalUsersActives = res.data.totalUsersActives.toString();
          this.totalUsersInactives = res.data.totalUsersInactives.toString();
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
    //Generamos un password aleatorio
    generatePasswordRand() {
      const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&";
      var pass = "";

      for (var i = 0; i < 10; i++) {
        pass += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      this.user.password = pass;
    }
  }
};
</script>

<style>
.card-stats .numbers .card-title {
  margin-top: 20px !important;
}

span {
  padding-right: 10px !important;
}
</style>
